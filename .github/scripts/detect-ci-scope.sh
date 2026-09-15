#!/usr/bin/env bash

set -euo pipefail

base_sha=${1:?Base commit SHA is required.}
head_sha=${2:?Head commit SHA is required.}

turbo_args='--affected'
run_tests='false'

if ! git cat-file -e "${base_sha}^{commit}" 2>/dev/null ||
  ! git cat-file -e "${head_sha}^{commit}" 2>/dev/null; then
  turbo_args=''
  run_tests='true'
else
  changed_paths=$(git diff --name-only "${base_sha}" "${head_sha}")

  while IFS= read -r changed_path; do
    case "${changed_path}" in
      .github/scripts/detect-ci-scope.sh | \
        .github/workflows/ci.yml | \
        eslint.config.js | \
        package.json | \
        pnpm-lock.yaml | \
        pnpm-workspace.yaml | \
        turbo.json)
        turbo_args=''
        ;;
    esac

    case "${changed_path}" in
      .github/scripts/detect-ci-scope.sh | \
        .github/workflows/ci.yml | \
        apps/client/* | \
        configs/* | \
        package.json | \
        packages/* | \
        pnpm-lock.yaml | \
        pnpm-workspace.yaml | \
        turbo.json)
        run_tests='true'
        ;;
    esac
  done <<< "${changed_paths}"
fi

printf 'turbo_args=%s\n' "${turbo_args}"
printf 'run_tests=%s\n' "${run_tests}"
