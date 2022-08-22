import { getConfig } from "./config";

export function getFavouriteFoods(): string[] {
  const config = getConfig();
  const foods = config.get("favourite_foods");

  return foods.map((food) => food.name);
}
