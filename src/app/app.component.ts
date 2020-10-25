import { Component, OnInit } from '@angular/core';
import uid from 'uid';

interface Flour {
  name: string;
  value: number;
  id?: string;
}

interface Ingredient {
  name: string;
  value: number;
  percentage?: number;
  id?: string;
}

interface Model {
  flours: Flour[];
  ingredients: Ingredient[];
  totalWeight: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  title = 'baking-percentage-calculator';

  private emptyModel: Model = {
    flours: [],
    ingredients: [],
    totalWeight: 0,
  };

  private defaultNewFlour: Flour = {
    name: 'Flour',
    value: 500,
  };

  private defaultIngredients: Ingredient[] = [
    {
      name: 'Water',
      value: 360,
    },
    {
      name: 'Sea Salt',
      value: 21,
    },
    {
      name: 'Instant Dried Yeast',
      value: 4,
    },
  ];

  private defaultNewIngredient: Ingredient = {
    name: 'Ingredient',
    value: 100,
  };

  public model: Model;

  public reset(): void {
    this.model = {
      flours: [],
      ingredients: [],
      totalWeight: 0,
    };

    this.addNewFlour();
    this.addDefaultIngredients();
    this.updateAllPercentages();
  }

  public addNewFlour(): void {
    const newFlour: Flour = {
      ...this.defaultNewFlour,
      id: uid(),
    };

    this.model.flours.push(newFlour);
    this.updateTotalWeight();
    this.updateAllIngredientValues();
  }

  public addDefaultIngredients(): void {
    this.defaultIngredients.forEach(x => this.addNewIngredient(x));
  }

  public addNewIngredient(ingredient?: Ingredient): void {
    const properties = ingredient || this.defaultNewIngredient;

    const newIngredient = {
      ...properties,
      percentage: this.calculatePercentage(this.defaultNewIngredient),
      id: uid(),
    };

    this.model.ingredients.push(newIngredient);

    this.updateTotalWeight();
  }

  get totalFlourWeight(): number {
    let weight = 0;
    this.model.flours.forEach(x => {
      weight = weight + x.value;
    });
    return weight;
  }

  private calculatePercentage(ingredient: Ingredient): number {
    return ingredient.value / this.totalFlourWeight;
  }

  private calculateValue(ingredient: Ingredient): number {
    return this.totalFlourWeight * ingredient.percentage;
  }

  private updateTotalWeight(): void {
    let total = 0;
    [...this.model.flours, ...this.model.ingredients].forEach(x => {
      total = total + x.value;
    });
    this.model.totalWeight = total;
  }

  private updateAllPercentages(): void {
    const ingredients = this.model.ingredients;
    ingredients.forEach(ingredient => {
      ingredient.percentage = this.calculatePercentage(ingredient);
    });
  }

  private updateAllIngredientValues(): void {
    const ingredients = this.model.ingredients;
    ingredients.forEach(ingredient => {
      ingredient.value = this.calculateValue(ingredient);
    });

  }

  public onFlourChange(value: string | number, id: string): void {
    const modelFlour = this.model.flours.find(x => x.id === id);
    modelFlour.value = Number(value);
    this.updateTotalWeight();
    this.updateAllIngredientValues();
  }

  public onIngredientValueChange(value: string, id: string): void {
    const modelIngredient = this.model.ingredients.find(x => x.id === id);
    modelIngredient.value = Number(value);
    modelIngredient.percentage = this.calculatePercentage(modelIngredient);
    this.updateTotalWeight();
  }

  public onIngredientPercentageChange(percentage: string, id: string): void {
    const modelIngredient = this.model.ingredients.find(x => x.id === id);
    modelIngredient.percentage = Number(percentage);
    modelIngredient.value = this.calculateValue(modelIngredient);
    this.updateTotalWeight();
  }

  public adjustRecipe(factor: number): void {
    this.model.flours.forEach(flour => {
      this.onFlourChange(flour.value * factor, flour.id);
    });
  }

  public deleteFlour(id: string): void {
    this.model.flours = this.model.flours.filter(flour => flour.id !== id);
    this.updateAllIngredientValues();
  }

  public deleteIngredient(id: string): void {
    this.model.ingredients = this.model.ingredients.filter(ingredient => ingredient.id !== id);
    this.updateTotalWeight();
  }

  ngOnInit(): void {
    this.reset();
  }
}
