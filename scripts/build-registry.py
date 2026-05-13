#!/usr/bin/env python3
"""Build skill-registry.json and skill-metadata.json from all account repos."""
import json, os, subprocess, re

REPOS = [
    ("ishuru", "ishuru-skills", "general"),
    ("ishuru", "sd-dataeng-skills", "data-engineering"),
    ("s4b7-ai", "s4b7-ai-skills", "ai-ml"),
    ("sabarish-duvvuru", "productivity-skills", "productivity"),
    ("theleostark", "infra-skills", "infrastructure"),
    ("ishork", "research-skills", "research-content"),
    ("sduvvuru-qx", "enterprise-skills", "enterprise"),
    ("duvvurs", "duvvur-skills", "azure-finops"),
]

def gh_api(endpoint):
    """Call gh api and return parsed JSON."""
    result = subprocess.run(
        ["gh", "api", endpoint],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        return None
    return json.loads(result.stdout)

def fetch_repo_skills(account, repo):
    """Fetch skill list from repo contents."""
    data = gh_api(f"repos/{account}/{repo}/contents/skills")
    if not data:
        return []
    return sorted([item["name"] for item in data if item["type"] == "dir"])

def fetch_skill_frontmatter(account, repo, skill_dir):
    """Fetch and parse SKILL.md frontmatter."""
    data = gh_api(f"repos/{account}/{repo}/contents/skills/{skill_dir}/SKILL.md")
    if not data or "content" not in data:
        return None
    
    import base64
    content = base64.b64decode(data["content"]).decode("utf-8", errors="replace")
    
    fm_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    meta = {"slug": skill_dir, "repo": f"{account}/{repo}"}
    
    if fm_match:
        fm = fm_match.group(1)
        for field in ['name', 'description']:
            m = re.search(rf'^{field}:\s*[\'"]?(.+?)[\'"]?\s*$', fm, re.MULTILINE)
            if m:
                meta[field] = m.group(1).strip("'\"")
        for field in ['category', 'family', 'lifecycle', 'canonical_slug']:
            m = re.search(rf'^\s+{field}:\s*[\'"]?(.+?)[\'"]?\s*$', fm, re.MULTILINE)
            if m:
                meta[field] = m.group(1).strip("'\"")
        m = re.search(r'depends_on:\s*\[(.+?)\]', fm)
        if m:
            meta['depends_on'] = [x.strip().strip("'\"") for x in m.group(1).split(',')]
    
    meta['line_count'] = content.count('\n')
    return meta

def main():
    registry = {
        "version": "1.0.0",
        "updated": subprocess.check_output(["date", "-u", "+%Y-%m-%dT%H:%M:%SZ"]).decode().strip(),
        "accounts": {},
        "total_skills": 0,
        "subscription_routing": {
            "providers": {
                "glm-global-coding-plan": {"type": "free", "model": "GLM-5.1", "context": "128K", "privacy": "GREEN-only"},
                "codex": {"type": "subscription", "model": "GPT-5.x", "context": "200K", "privacy": "all-tiers"},
                "chatgpt-plus": {"type": "subscription", "model": "GPT-5.x", "context": "200K", "privacy": "all-tiers"},
                "pi-api-key": {"type": "api-key", "model": "GLM-5.1", "context": "128K", "privacy": "GREEN-only"},
            },
            "routing_matrix": {
                "deep_review": {"primary": "codex", "fallback": "glm-global-coding-plan"},
                "implementation": {"primary": "glm-global-coding-plan", "fallback": "codex"},
                "evaluation": {"primary": "chatgpt-plus", "fallback": "glm-global-coding-plan"},
                "cross_validation": {"primary": "chatgpt-plus", "fallback": "codex"},
                "vision": {"primary": "glm-global-coding-plan", "fallback": "codex"},
                "large_context": {"primary": "codex", "fallback": "glm-global-coding-plan"},
                "enterprise_red": {"primary": "codex", "fallback": "local-ollama"},
            }
        }
    }
    
    all_metadata = []
    total = 0
    
    for account, repo, domain in REPOS:
        print(f"Fetching {account}/{repo}...")
        skills = fetch_repo_skills(account, repo)
        total += len(skills)
        
        if account not in registry["accounts"]:
            registry["accounts"][account] = {"repos": {}}
        
        registry["accounts"][account]["repos"][repo] = {
            "url": f"https://github.com/{account}/{repo}",
            "domain": domain,
            "skill_count": len(skills),
            "skills": skills
        }
        
        # Fetch metadata for each skill
        for skill in skills:
            meta = fetch_skill_frontmatter(account, repo, skill)
            if meta:
                all_metadata.append(meta)
    
    registry["total_skills"] = total
    
    # Write outputs
    with open("skill-registry.json", "w") as f:
        json.dump(registry, f, indent=2)
    
    with open("skill-metadata.json", "w") as f:
        json.dump(all_metadata, f, indent=2)
    
    print(f"\nRegistry: {total} skills, {len(all_metadata)} with metadata")
    print(f"Accounts: {len(registry['accounts'])}")

if __name__ == "__main__":
    main()
