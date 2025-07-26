import { useMutation, useQueryClient } from '@tanstack/react-query';

import { httpClient } from '../services/httpClient';

type CreateMealFromTextResponse = {
  mealId: string;
};

type CreateMealFromTextParams = {
  onSuccess(mealId: string): void;
};

export function useCreateMealFromText({ onSuccess }: CreateMealFromTextParams) {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (text: string) => {
      const { data } = await httpClient.post<CreateMealFromTextResponse>(
        '/meals',
        {
          fileType: 'text/plain',
          text,
        }
      );

      return { mealId: data.mealId };
    },
    onSuccess: ({ mealId }) => {
      onSuccess(mealId);
      queryClient.refetchQueries({ queryKey: ['meals'] });
    },
  });

  return {
    createMealFromText: mutateAsync,
    isLoading: isPending,
  };
}
