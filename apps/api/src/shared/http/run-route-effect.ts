import { Effect, Either } from "effect";

export const runRouteEffect = async <A>(effect: Effect.Effect<A, unknown>) => {
  const result = await Effect.runPromise(Effect.either(effect));

  if (Either.isLeft(result)) {
    throw result.left;
  }

  return result.right;
};
