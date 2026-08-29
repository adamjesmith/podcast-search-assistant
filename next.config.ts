import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16.3 auto-writes an "agent rules" block into CLAUDE.md/AGENTS.md
  // on `next dev` (see AI_WORKFLOW_LOG.md for the incident this follows up
  // on: it was caught, reverted, and evaluated before this was set).
  // Disabled deliberately rather than reverting the diff by hand every run.
  agentRules: false,
};

export default nextConfig;
