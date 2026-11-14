/* =========================================================
   03-sync — self-hosted JSON sync (optional)
   ========================================================= */
function apiHeaders(extra) {
  var h = { 'Accept': 'application/json' };
  if (sync.token) h['X-Notebook-Token'] = sync.token;
  if (extra) Object.keys(extra).forEach(function (k) { h[k] = extra[k]; });
  return h;
}

function setSyncState(mode, detail) {
  sync.mode = mode;
  sync.online = mode === 'online';
  if (detail) sync.detail = detail;
  renderSyncStatus();
}

async function initSync() {
  if (PAGES) {
    setSyncState('local', 'GitHub Pages 静态版 · 本机保存');
    return;
  }
  if (!/^https?:$/.test(location.protocol)) {
    setSyncState('local', '文件打开 · 本机保存');
    return;
  }
  try {
    var health = await fetch('/api/health', { headers: apiHeaders(), cache: 'no-store' });
    if (health.status === 401) {
      sync.available = true;
      setSyncState('locked', '需要访问口令');
      if (typeof render === 'function') render();
      return;
    }
    if (!health.ok) throw new Error('no api');
    var healthInfo = null;
    try { healthInfo = await health.json(); } catch (e) {}
    sync.available = true;
    if (healthInfo && healthInfo.stateCorrupted) {
      setSyncState('conflict', '本地数据文件损坏，已保留原始副本');
      toast('本地数据文件损坏，已保留原始副本；请先导出副本或恢复备份，再继续保存');
      if (typeof render === 'function') render();
      return;
    }
    var res = await fetch('/api/state', { headers: apiHeaders(), cache: 'no-store' });
    if (res.status === 401) {
      setSyncState('locked', '需要访问口令');
      if (typeof render === 'function') render();
      return;
    }
    if (res.status >= 500) {
      var stateError = null;
      try { stateError = await res.json(); } catch (e) {}
      if (stateError && stateError.code === 'STATE_CORRUPTED') {
        setSyncState('conflict', '本地数据文件损坏，已保留原始副本');
        toast('本地数据文件损坏，已保留原始副本；请先导出副本或恢复备份，再继续保存');
        if (typeof render === 'function') render();
        return;
      }
      throw new Error('bad state');
    }
    if (!res.ok) throw new Error('bad state');
    var remote = await res.json();
    sync.baseRev = Number.isFinite(state.syncBaseRev) ? state.syncBaseRev : Number(remote.rev || 0);
    if (remote && remote.state && remote.state.entries) {
      var unsynced = state.syncDirty === true || (!isFreshLocal && state.syncBaseRev == null && state.updatedAt !== remote.state.updatedAt);
      if (unsynced && (!Number.isFinite(state.syncBaseRev) || Number(remote.rev || 0) !== state.syncBaseRev)) {
        setSyncState('conflict', '本机改动与云端版本需要合并');
        toast('本机与云端都有数据，已保留本机内容；请先导出备份，再手动拉取并合并');
        return;
      }
      if (unsynced) {
        schedulePush(50);
        setSyncState('online', '等待同步本机改动');
        return;
      }
      var localTime = new Date(state.updatedAt).getTime();
      var remoteTime = new Date(remote.state.updatedAt || 0).getTime();
      if (isFreshLocal) {
        adoptRemote(remote, false);
        toast('已载入云端最新版本');
      } else if (remoteTime > localTime && (state.rev || 0) <= (remote.rev || 0)) {
        adoptRemote(remote, false);
        toast('已载入云端最新版本');
      } else if (remoteTime === localTime && (remote.rev || 0) > (state.rev || 0)) {
        state.rev = remote.rev;
        persistLocal();
      } else if ((state.rev || 0) > (remote.rev || 0)) {
        schedulePush(50);
      }
    } else {
      schedulePush(50);
    }
    sync.lastSync = remote && remote.updatedAt;
    setSyncState('online', remote && remote.rev != null ? ('rev ' + remote.rev) : '');
    if (subjectMigrationPending) { subjectMigrationPending = false; schedulePush(1000); }
  } catch (e) {
    sync.available = false;
    setSyncState('local', '未连接同步服务');
  }
  renderSyncStatus();
}

function adoptRemote(remote, skipRender) {
  if (!remote || !remote.state) return;
  var st = migrateState(remote.state);
  st.rev = remote.rev || st.rev || 0;
  st.syncDirty = false;
  st.syncBaseRev = Number(remote.rev || 0);
  sync.baseRev = st.syncBaseRev;
  st.updatedAt = remote.updatedAt || st.updatedAt;
  var theme = state.prefs ? state.prefs.theme : 'auto';
  state = st;
  isFreshLocal = false;
  state.prefs = state.prefs || {};
  state.prefs.theme = theme;
  var migratedKeys = subjectMigrationPending;
  persistLocal();
  if (migratedKeys) schedulePush(1000);
  applyTheme();
  if (!skipRender && typeof render === 'function') render();
}

var pushTimer = null;
function schedulePush(delay) {
  if (!sync.available) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(function () { pushSync(false); }, delay == null ? 900 : delay);
}

async function pushSync(manual) {
  if (!sync.available) {
    if (manual) toast('当前没有连接同步服务，数据只在本机');
    return;
  }
  if (sync.busy) { sync.pending = true; return; }
  sync.busy = true;
  renderSyncStatus();
  try {
    var attempts = 0;
    while (attempts < 3) {
      attempts++;
      var sentUpdatedAt = state.updatedAt;
      var body = JSON.stringify({ baseRev: Number.isFinite(sync.baseRev) ? sync.baseRev : (Number.isFinite(state.syncBaseRev) ? state.syncBaseRev : 0), state: state });
      var res = await fetch('/api/state', {
        method: 'PUT',
        headers: apiHeaders({ 'Content-Type': 'application/json' }),
        body: body
      });
      if (res.status === 409) {
        var cur = await res.json();
        state.syncDirty = true;
        setSyncState('conflict', '云端与本机存在冲突');
        toast('同步冲突：已保留本机改动。请先导出本机备份，再拉取并合并云端数据');
        break;
      }
      if (res.status === 401) {
        setSyncState('locked', '需要访问口令');
        toast('同步服务需要访问口令，请在设置里填写');
        break;
      }
      if (!res.ok) throw new Error('push failed');
      var data = await res.json();
      sync.baseRev = Number(data.rev);
      state.syncBaseRev = sync.baseRev;
      state.rev = data.rev;
      if (state.updatedAt === sentUpdatedAt) { state.updatedAt = data.updatedAt || state.updatedAt; state.syncDirty = false; }
      else { state.syncDirty = true; sync.pending = true; }
      persistLocal();
      sync.lastSync = data.updatedAt;
      setSyncState('online', 'rev ' + data.rev);
      if (manual) toast('已同步到云端 · rev ' + data.rev);
      break;
    }
  } catch (e) {
    setSyncState('offline', '同步失败，稍后重试');
    if (manual) toast('同步失败：' + (e.message || e));
  } finally {
    sync.busy = false;
    renderSyncStatus();
    if (sync.pending) { sync.pending = false; schedulePush(150); }
  }
}

async function pullSync(manual) {
  if (!sync.available) {
    if (manual) toast('未连接同步服务');
    return;
  }
  try {
    var res = await fetch('/api/state', { headers: apiHeaders(), cache: 'no-store' });
    if (res.status === 401) { setSyncState('locked', '需要访问口令'); return; }
    if (!res.ok) throw new Error('pull failed');
    var remote = await res.json();
    if (!remote.state || !remote.state.entries) { if (manual) toast('云端还没有数据'); return; }
    if (state.syncDirty || sync.mode === 'conflict') {
      if (manual && typeof confirmDialog === 'function') {
        confirmDialog('用云端数据替换本机内容？', '本机存在未同步改动。请先导出备份；继续将载入云端数据，之后可以再合并刚才的备份。', function () {
          adoptRemote(remote, false);
          setSyncState('online', 'rev ' + remote.rev);
          toast('已载入云端数据，可导入本机备份并合并');
        });
      } else setSyncState('conflict', '本机改动尚未同步');
      return;
    }
    var localTime = new Date(state.updatedAt).getTime();
    var remoteTime = new Date(remote.state.updatedAt || 0).getTime();
    if ((isFreshLocal && !(state.rev || 0)) || remoteTime > localTime) {
      adoptRemote(remote, false);
      toast('已拉取云端最新版本');
    } else if (manual) {
      toast('云端没有比本地更新的版本');
    }
    sync.lastSync = remote.updatedAt;
    setSyncState('online', 'rev ' + remote.rev);
  } catch (e) {
    setSyncState('offline', '拉取失败');
    if (manual) toast('拉取失败');
  }
}

function renderSyncStatus() {
  var text = sync.available
    ? (sync.online ? '云端同步 · ' + (sync.lastSync ? timeAgo(sync.lastSync) : '已连接') : (sync.mode === 'locked' ? '需要口令' : '未连接'))
    : '本机保存';
  if (sync.busy) text = '同步中…';
  qsa('[data-sync-text]').forEach(function (el) { el.textContent = text; });
  qsa('[data-sync-dot]').forEach(function (d) {
    d.className = 'sync-dot' + (sync.busy ? '' : sync.online ? ' ok' : sync.available ? ' err' : '');
  });
}
