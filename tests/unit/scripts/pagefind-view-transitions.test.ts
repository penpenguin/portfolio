import { describe, expect, it, vi } from 'vitest';

import {
  bindPagefindViewTransitionRefresh,
  pruneDisconnectedPagefindComponents,
} from '../../../src/scripts/pagefind-view-transitions';

const createPagefindState = () => {
  const disconnectedModal = {
    componentSubtype: 'modal',
    isConnected: false,
  };
  const connectedModal = {
    componentSubtype: 'modal',
    isConnected: true,
  };
  const disconnectedTrigger = {
    componentSubtype: 'modal-trigger',
    isConnected: false,
  };
  const connectedTrigger = {
    componentSubtype: 'modal-trigger',
    isConnected: true,
  };
  const instance = {
    components: [
      disconnectedModal,
      connectedModal,
      disconnectedTrigger,
      connectedTrigger,
    ],
    componentsByType: {
      utility: [
        disconnectedModal,
        connectedModal,
        disconnectedTrigger,
        connectedTrigger,
      ],
    },
    reconcileAria: vi.fn(),
  };
  const pagefindComponents = {
    getInstanceManager: () => ({
      getInstance: () => instance,
    }),
  };

  return {
    connectedModal,
    connectedTrigger,
    instance,
    pagefindComponents,
  };
};

const createTestDocument = () => {
  const listeners = new Map<string, EventListener[]>();
  const documentRef = {
    addEventListener: vi.fn(
      (type: string, listener: EventListenerOrEventListenerObject | null) => {
        if (typeof listener === 'function') {
          listeners.set(type, [...(listeners.get(type) ?? []), listener]);
        }
      }
    ),
    removeEventListener: vi.fn(
      (type: string, listener: EventListenerOrEventListenerObject | null) => {
        if (typeof listener === 'function') {
          listeners.set(
            type,
            (listeners.get(type) ?? []).filter(
              (registered) => registered !== listener
            )
          );
        }
      }
    ),
  } as unknown as Document;

  const dispatch = (type: string, event: Partial<Event> = {}) => {
    listeners.get(type)?.forEach((listener) => {
      listener(event as Event);
    });
  };

  return { dispatch, documentRef };
};

describe('Pagefind view transition refresh', () => {
  it('removes disconnected Pagefind utilities before the modal trigger resolves a dialog', () => {
    const { connectedModal, connectedTrigger, instance, pagefindComponents } =
      createPagefindState();

    pruneDisconnectedPagefindComponents(pagefindComponents);

    expect(instance.components).toEqual([connectedModal, connectedTrigger]);
    expect(instance.componentsByType.utility).toEqual([
      connectedModal,
      connectedTrigger,
    ]);
    expect(instance.reconcileAria).toHaveBeenCalledTimes(1);
  });

  it('refreshes Pagefind when Astro swaps pages and before trigger clicks', () => {
    const { connectedModal, connectedTrigger, instance, pagefindComponents } =
      createPagefindState();
    const { dispatch, documentRef } = createTestDocument();
    const windowRef = {
      PagefindComponents: pagefindComponents,
      navigator: { platform: 'MacIntel', userAgent: '' },
      requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      }),
      setTimeout: vi.fn(),
    } as unknown as Window & {
      PagefindComponents: typeof pagefindComponents;
    };

    const cleanup = bindPagefindViewTransitionRefresh(documentRef, windowRef);

    dispatch('astro:after-swap');

    expect(instance.components).toEqual([connectedModal, connectedTrigger]);

    instance.components = [
      { componentSubtype: 'modal', isConnected: false },
      connectedModal,
      connectedTrigger,
    ];
    instance.componentsByType.utility = [...instance.components];

    dispatch('click', {
      target: {
        closest: (selector: string) =>
          selector === 'pagefind-modal-trigger' ? {} : null,
      } as unknown as EventTarget,
    });

    expect(instance.components).toEqual([connectedModal, connectedTrigger]);

    cleanup();
  });
});
