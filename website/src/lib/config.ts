/** Centralized configuration for SkillWiki. Single source of truth: config.json at repo root. */
import sharedConfig from '../../../config.json';

export const GITHUB_REPO = sharedConfig.GITHUB_REPO;
export const GITHUB_BRANCH = sharedConfig.GITHUB_BRANCH;
export const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}`;
export const REPO_TREE_BASE = `https://github.com/${GITHUB_REPO}/tree/${GITHUB_BRANCH}`;
