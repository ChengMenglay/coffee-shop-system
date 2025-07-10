import React from "react";
import IngredientForm from "./IngredientForm";

function IngredientPage({ params }: { params: { ingredientId: string } }) {
  return (
    <div className="flex-col h-full">
      <div className="space-y-4 px-6 py-8">
        <IngredientForm />
      </div>
    </div>
  );
}

export default IngredientPage;
