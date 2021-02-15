import { Component, Input, OnInit } from '@angular/core';
import { Model } from '../app.component';

@Component({
  selector: 'app-printer',
  templateUrl: './printer.component.html',
  styleUrls: ['./printer.component.scss']
})
export class PrinterComponent {

  @Input() model: Model;
  @Input() title: string;
  @Input() showPrinter: boolean;

}
