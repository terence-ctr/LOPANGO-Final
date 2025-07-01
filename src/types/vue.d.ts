import { DirectiveBinding } from 'vue';

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    vClickOutside: (binding: DirectiveBinding) => void;
  }
}

export {};
