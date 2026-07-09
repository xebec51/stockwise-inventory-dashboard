export type MutationState = {
  errors?: Record<string, string[] | undefined>;
  message?: string;
  success?: boolean;
};

export const initialMutationState: MutationState = {};
