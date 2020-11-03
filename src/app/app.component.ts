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
  numberOfLoaves: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

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
  public panelOpenState = false;

  public reset(): void {
    this.model = {
      flours: [],
      ingredients: [],
      totalWeight: 0,
      numberOfLoaves: 1,
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

  get gramsPerLoaf(): number {
    return this.model.totalWeight / this.model.numberOfLoaves;
  }

  private calculatePercentage(ingredient: Ingredient): number {
    return ingredient.value / this.totalFlourWeight * 100;
  }

  private calculateValue(ingredient: Ingredient): number {
    return this.totalFlourWeight * ingredient.percentage / 100;
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

  public onFlourChange(value: number | string, id: string): void {
    const valueAsNumber = Number(value);
    const modelFlour = this.model.flours.find(x => x.id === id);

    if (valueAsNumber === 0) {
      modelFlour.value = 1;
    } else if (valueAsNumber < 0) {

    } else {
      modelFlour.value = Number(valueAsNumber);
    }

    this.updateAllIngredientValues();
    this.updateTotalWeight();
  }

  public onIngredientValueChange(value: string, id: string): void {
    const modelIngredient = this.model.ingredients.find(x => x.id === id);
    const valueAsNumber = Number(value);

    if (valueAsNumber < 0) {
      modelIngredient.value = valueAsNumber * -1;
    } else if (valueAsNumber === 0) {
      modelIngredient.value = 1;
    } else {
      modelIngredient.value = valueAsNumber;
    }

    modelIngredient.percentage = this.calculatePercentage(modelIngredient);
    this.updateTotalWeight();
  }

  public onIngredientPercentageChange(percentage: string, id: string): void {
    const modelIngredient = this.model.ingredients.find(x => x.id === id);
    const percentageAsNumber = Number(percentage);

    if (percentageAsNumber < 0) {
      modelIngredient.percentage = percentageAsNumber * -1;
    } else if (percentageAsNumber === 0){
      modelIngredient.percentage = 1;
    } else {
      modelIngredient.percentage = percentageAsNumber;
    }

    modelIngredient.value = this.calculateValue(modelIngredient);
    this.updateTotalWeight();
  }

  public adjustRecipe(factor: number): void {
    this.model.flours.forEach(flour => {
      this.onFlourChange(flour.value * factor, flour.id);
    });
    this.model.numberOfLoaves = this.model.numberOfLoaves * factor;
  }

  public deleteFlour(id: string): void {
    this.model.flours = this.model.flours.filter(flour => flour.id !== id);
    this.updateAllIngredientValues();
    this.updateTotalWeight();
  }

  public deleteIngredient(id: string): void {
    this.model.ingredients = this.model.ingredients.filter(ingredient => ingredient.id !== id);
    this.updateTotalWeight();
  }

  ngOnInit(): void {
    this.reset();
  }

  public onLoafChange(event): void {
    if (Number(event.target.value) < 1) {
      event.preventDefault();
      this.model.numberOfLoaves = 1;
    }
  }
}
