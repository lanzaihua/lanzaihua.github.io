# Four-subject mistake notebook: local quality and release entry points.
PYTHON ?= python
NODE ?= node
NPM ?= npm

.PHONY: help test qa languages check build package serve

help:
	@echo "make check      run tests, QA, language gate and Python audit"
	@echo "make build      build dist, dist-pages and root index.html"
	@echo "make package    rebuild source.zip, static zip and SHA256SUMS"
	@echo "make serve      start the local server"

test:
	$(NPM) test

qa:
	$(NODE) tools/qa-bank-strict.js --strict-difficulty
	$(NODE) tools/qa-site-consistency.js

languages:
	$(NODE) tools/check_repo_languages.js
	$(PYTHON) tools/audit_bank.py --strict-difficulty

check: test qa languages

build:
	$(NODE) build.js
	$(NODE) build.js --pages
	$(NODE) tools/publish-pages.js

package:
	$(PYTHON) tools/package-source.py --all

serve:
	$(NODE) server.js
