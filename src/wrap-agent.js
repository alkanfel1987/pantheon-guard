/**
 * pantheon-guard · wrap-agent
 *
 * Thin runtime wrapper around an agent. Every action goes through the
 * 5-step algorithm (which itself runs Mahā-vrata first); only allowed
 * actions reach the executor.
 *
 *   const safeAgent = wrapAgent({ name, svadharma });
 *   const result = await safeAgent.act(action, async (a) => callLLM(a));
 *   if (!result.allowed) console.log('blocked:', result.reason);
 *
 * Failure mode is intentional: the wrapper does not throw on a violation,
 * it returns a structured `{ allowed: false, reason, result }`. The caller
 * decides whether to log, retry, or surface the block to the user.
 */

import { checkAction } from './index.js';

/**
 * @typedef {Object} WrappedAgent
 * @property {(action: Object, executor: (action: Object) => any) => Promise<{
 *   allowed: boolean,
 *   reason?: string,
 *   output?: any,
 *   result: Object
 * }>} act
 */

/**
 * Wrap an agent so its actions pass through the deterministic conscience layer.
 *
 * @param {Object} agent — agent descriptor with at least `{ name, svadharma }`.
 *   `svadharma` must follow {@link SVADHARMA_SCHEMA}: jati × guna × karma × svabhava.
 * @returns {WrappedAgent}
 */
export function wrapAgent(agent) {
  if (!agent || typeof agent !== 'object') {
    throw new TypeError('wrapAgent: agent descriptor is required');
  }
  if (!agent.svadharma) {
    throw new TypeError('wrapAgent: agent.svadharma is required (jati × guna × karma × svabhava)');
  }

  return {
    /**
     * Run an action through the conscience layer, executing it only if allowed.
     *
     * @param {Object} action — action descriptor (see checkMahavrata / runFiveSteps)
     * @param {(action: Object) => any | Promise<any>} executor — invoked iff allowed
     * @returns {Promise<{allowed: boolean, reason?: string, output?: any, result: Object}>}
     */
    async act(action, executor) {
      const result = checkAction(agent, action);

      if (!result.passes) {
        const reason =
          result.failedStep === 'mahavrata'
            ? result.mahavrataResult.violations
                .map((v) => `${v.rule}: ${v.reason}`)
                .join('; ')
            : `${result.failedStep}: ${result.recommendation}`;
        return { allowed: false, reason, result };
      }

      if (typeof executor !== 'function') {
        throw new TypeError('wrapAgent.act: executor function is required');
      }

      const output = await executor(action);
      return { allowed: true, output, result };
    },
  };
}
