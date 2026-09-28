/** Accounts the application publishes for testing, each with a known behaviour. */
export const USERS = {
  standard: { username: 'standard_user', password: 'secret_sauce' },
  lockedOut: { username: 'locked_out_user', password: 'secret_sauce' },
  problem: { username: 'problem_user', password: 'secret_sauce' },
  slow: { username: 'performance_glitch_user', password: 'secret_sauce' },
  visual: { username: 'visual_user', password: 'secret_sauce' },
  errorProne: { username: 'error_user', password: 'secret_sauce' },
} as const;

export const CHECKOUT = {
  firstName: 'Qa',
  lastName: 'Tester',
  postalCode: '78701',
};
