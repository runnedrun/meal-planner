import { setters } from "@/data/fb"
import { recipes } from "@/functions/src/test_data/recipes"
import { Timestamp } from "firebase/firestore"

const prepRecipes = () => {
  recipes.forEach((recipe) => {
    setters.recipe(recipe.uid, {
      ...recipe,
      archived: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  })
}

export const prep = () => {
  return (
    <div className="text-black" onClick={prepRecipes}>
      Prep
    </div>
  )
}

export default prep
