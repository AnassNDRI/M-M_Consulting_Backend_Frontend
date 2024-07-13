import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../../module/Material.module';

interface DialogData {
  title: string;
  message: string;
  buttons: { text: string; value: any; class?: string }[];
  messageClass?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MaterialModule,
    FormsModule,
    TranslateModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
})
export class ConfirmDialogComponent {
  constructor(
    // Permet de contrôler la boîte de dialogue
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    // Injecte des données dans la boîte de dialogue, comme le titre et le message
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}
}
