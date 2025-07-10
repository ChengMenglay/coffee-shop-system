import React from "react";
import IngredientClient from "./components/client";

function IngredientPage() {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 px-6 py-8">
        <IngredientClient />
      </div>
    </div>
  );
}

export default IngredientPage;
