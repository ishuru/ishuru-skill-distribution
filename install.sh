#!/usr/bin/env bash
# ishuru-skills Multi-Account Installer
# Install all or category-specific skills from 7 GitHub accounts
# Usage: ./install.sh [category|all|list]
set -euo pipefail

SKILL_ROOT="${SKILL_ROOT:-$HOME/.agents/skills}"

ACCOUNTS='
ishuru|ishuru-skills
ishuru|sd-dataeng-skills
s4b7-ai|s4b7-ai-skills
sabarish-duvvuru|productivity-skills
theleostark|infra-skills
ishork|research-skills
sduvvuru-qx|enterprise-skills
duvvurs|duvvur-skills
'

install_repo() {
  local account="$1" repo="$2"
  local url="https://github.com/${account}/${repo}"
  local target="$SKILL_ROOT"
  
  echo "  Installing ${account}/${repo}..."
  
  # Clone to temp
  local tmpdir
  tmpdir=$(mktemp -d)
  git clone --depth=1 "$url" "$tmpdir" 2>/dev/null
  
  if [ -d "$tmpdir/skills" ]; then
    cp -r "$tmpdir/skills/"* "$target/" 2>/dev/null || true
    local count
    count=$(ls -1d "$tmpdir/skills/"*/ 2>/dev/null | wc -l | tr -d ' ')
    echo "    ✓ $count skills installed"
  fi
  
  rm -rf "$tmpdir"
}

case "${1:-all}" in
  list)
    echo "ishuru-skills Multi-Account Installer"
    echo ""
    echo "Available categories:"
    echo "  all              Install everything"
    echo "  dev-workflow     GitHub ops, TDD, naming, pre-commit"
    echo "  design-ui        Design systems, dashboards, PPTX, rendering"
    echo "  ai-agent         LangGraph, multi-model, skill factory, crystallize"
    echo "  model-subscription  Routing, maximize, break-even, cost tracking"
    echo "  infra-mesh       Mesh ops, devices, storage, security, shadow ops"
    echo "  research-content X/Twitter, YouTube, Reddit, patterns, knowledge"
    echo "  enterprise       Astemo, FH4S, M365, communication"
    echo "  data-engineering SQL, Fabric, migration, quality"
    echo "  productivity     Calendar, focus, Bee AI, notes, subscriptions"
    echo "  platform         Craft Agents OSS, speak2mcp"
    echo ""
    echo "Accounts: ishuru, s4b7-ai, sabarish-duvvuru, theleostark, ishork, sduvvuru-qx, duvvurs"
    ;;
  all)
    echo "Installing ALL skills from 7 accounts..."
    mkdir -p "$SKILL_ROOT"
    echo "$ACCOUNTS" | while IFS='|' read -r account repo; do
      [ -z "$account" ] && continue
      install_repo "$account" "$repo"
    done
    echo ""
    echo "✓ Complete. Skills in $SKILL_ROOT"
    ;;
  dev-workflow|design-ui|ai-agent|model-subscription|infra-mesh|research-content|enterprise-astemo|data-engineering|productivity)
    echo "Installing $1 category..."
    echo "  (Installs full repos containing $1 skills)"
    mkdir -p "$SKILL_ROOT"
    # Map categories to repos
    case "$1" in
      dev-workflow|code-quality) install_repo "ishuru" "ishuru-skills" ;;
      design-ui) install_repo "ishuru" "ishuru-skills" ;;
      ai-agent) install_repo "s4b7-ai" "s4b7-ai-skills" ;;
      model-subscription) install_repo "sabarish-duvvuru" "productivity-skills" ;;
      infra-mesh) install_repo "theleostark" "infra-skills" ;;
      research-content) install_repo "ishork" "research-skills" ;;
      enterprise-astemo) install_repo "sduvvuru-qx" "enterprise-skills" ;;
      data-engineering) install_repo "ishuru" "sd-dataeng-skills" ;;
      productivity) install_repo "sabarish-duvvuru" "productivity-skills" ;;
    esac
    echo "✓ $1 skills installed"
    ;;
  *)
    echo "Unknown category: $1"
    echo "Run '$0 list' for available categories"
    exit 1
    ;;
esac
