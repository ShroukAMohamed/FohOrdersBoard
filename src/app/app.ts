import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';

@Component({
  imports: [RouterOutlet, Toast],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {}
