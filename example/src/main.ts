import { initConfig } from "./config";
import { getFavouriteFoods } from "./favouriteFoods";

// Only run following code if this file is directly called
if (require.main === module) main();

async function main() {
  const config = await initConfig();

  console.log(`Hello ${config.get("name")}`);

  const favouriteFoods = getFavouriteFoods();
  console.log("Your favourite foods are");
  favouriteFoods.forEach((food) => console.log(`- ${food}`));

  console.log("\n\n");
  console.log("Try modifying the config and see what happens.");
}
