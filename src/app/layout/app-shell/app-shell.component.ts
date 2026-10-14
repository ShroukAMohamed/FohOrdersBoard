import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { TopNavigationComponent } from '../top-navigation/top-navigation.component';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, TopNavigationComponent],
  templateUrl: './app-shell.component.html',
})
export class AppShellComponent {}
