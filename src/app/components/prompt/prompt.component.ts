import {
  ChangeDetectionStrategy,
  Component,
  Renderer2,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WebllmService } from '@services';
import { NpmChatStore } from '@store';

@Component({
  selector: 'app-prompt',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './prompt.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptComponent {
  readonly #webllmService = inject(WebllmService);
  readonly #npmChatStore = inject(NpmChatStore);
  readonly #renderer = inject(Renderer2);

  message = signal('');
  hasMessage = computed(() => this.message() !== '');
  isLlmLoaded = this.#npmChatStore.isLlmLoaded;

  onMessageChange($textarea: HTMLTextAreaElement, value: string): void {
    this.message.set(value);
    this.#renderer.setStyle($textarea, 'height', 'auto');
    const textAreaHeight = $textarea.scrollHeight;
    this.#renderer.setStyle($textarea, 'height', `${textAreaHeight}px`);
  }

  submitMessage(event: Event): void {
    event.preventDefault();
    const message = this.message();
    this.#npmChatStore.addMessage({
      role: 'user',
      content: message,
    });
    this.message.set('');
    const messages = this.#npmChatStore.selectMessages().map((message) => {
      return {
        ...message(),
        content: message().content,
      };
    });
    this.#webllmService.getChatCompletionStream(messages);
  }
}
