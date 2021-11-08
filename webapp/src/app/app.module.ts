import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";


import { AppComponent } from "./app.component";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { NgxSpinnerModule } from "ngx-spinner";
import { ServerListComponent } from "./serverlist/serverlist.component";
import { ServerViewComponent } from "./serverlist/serverview/serverview.component";

import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faPlay, faStop, faSyncAlt, faPlus, faSignInAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';


@NgModule({
  declarations: [AppComponent, ServerListComponent, ServerViewComponent ],
  imports: [BrowserModule, HttpClientModule, FormsModule, NgxSpinnerModule, BrowserAnimationsModule, FontAwesomeModule],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(iconLibrary: FaIconLibrary) {
    iconLibrary.addIcons(faPlay, faStop, faSyncAlt, faPlus, faSignInAlt, faSignOutAlt);
  }

}
