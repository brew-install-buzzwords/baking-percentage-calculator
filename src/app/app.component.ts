import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import uid from 'uid';
import table from 'text-table';

export interface Flour {
  name: string;
  value: number;
  id?: string;
}

export interface Ingredient {
  name: string;
  value: number;
  percentage?: number;
  id?: string;
}

export interface Model {
  name: string;
  flours: Flour[];
  ingredients: Ingredient[];
  totalWeight: number;
  numberOfLoaves: number;
}

const RECIPE_CARD_INGREDIENT_CHAR_LIMIT = 13;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild('recipeCardSvg', {read: ElementRef, static: false}) recipeCardSvg: ElementRef;

  public title = 'Bread Ratio Calculator';
  public showPrinter = false;
  public showPreview = false;
  public showCharLimitWarning = false;

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
      name: 'Instant Yeast',
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
      name: 'My Bread Recipe',
      flours: [],
      ingredients: [],
      totalWeight: 0,
      numberOfLoaves: 1,
    };

    this.addNewFlour();
    this.addDefaultIngredients();
    this.updateAllPercentages();

    this.showPreview = false;
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

  public createRecipeCardPreview(): void {
    this.showPreview = true;
  }

  public get svgRows(): string[] {
    let limitExceeded = false;
    const items = [['Ingredient', 'Weight(g)', '%']];

    [...this.model.flours, ...this.model.ingredients].forEach((item: any) => {
      if (item.name.length > RECIPE_CARD_INGREDIENT_CHAR_LIMIT) {
        limitExceeded = true;
      }
      items.push([item.name.substr(0, RECIPE_CARD_INGREDIENT_CHAR_LIMIT), this.round(item.value), this.round(item.percentage) || '']);
    });

    const t = table(items, { align: [ 'l', 'r', 'r' ] });
    this.showCharLimitWarning = limitExceeded;
    return t.split('\n');
  }

  public createRecipeCard(): void {
    const svgString = new XMLSerializer().serializeToString(this.recipeCardSvg.nativeElement);
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const DOMURL: any = window.URL || window.webkitURL;
    const img = new Image();
    const svg = new Blob([svgString], {type: 'image/svg+xml'});
    const url = DOMURL.createObjectURL(svg);
    img.onload = () => {
        ctx.drawImage(img, 0, 0, 2160, 2160);
        const pngUrl = canvas.toDataURL('image/png', 1.0);

        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = 'recipe.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        DOMURL.revokeObjectURL(pngUrl);
    };
    img.src = url;
  }

  private round(num: number, decimalPlaces: number = 2): number {
    return Math.round((num + Number.EPSILON) * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
  }
}
