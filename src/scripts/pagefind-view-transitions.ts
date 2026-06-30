type PagefindComponent = {
  componentSubtype?: string | null;
  isConnected?: boolean;
};

type PagefindInstance = {
  components?: PagefindComponent[];
  componentsByType?: Record<string, PagefindComponent[]>;
  reconcileAria?: () => void;
};

type PagefindComponentsApi = {
  getInstanceManager?: () =>
    | {
        getInstance?: (name?: string) => PagefindInstance | undefined;
      }
    | undefined;
};

type PagefindWindow = Window & {
  PagefindComponents?: PagefindComponentsApi;
};

const isConnectedPagefindComponent = (component: PagefindComponent) =>
  component.isConnected !== false;

const getDefaultPagefindInstance = (
  pagefindComponents?: PagefindComponentsApi
) => pagefindComponents?.getInstanceManager?.()?.getInstance?.('default');

export const pruneDisconnectedPagefindComponents = (
  pagefindComponents?: PagefindComponentsApi
) => {
  const instance = getDefaultPagefindInstance(pagefindComponents);

  if (!instance) {
    return;
  }

  // Pagefind keeps disconnected custom elements in this registry after Astro swaps.
  if (Array.isArray(instance.components)) {
    instance.components = instance.components.filter(
      isConnectedPagefindComponent
    );
  }

  if (instance.componentsByType) {
    Object.entries(instance.componentsByType).forEach(([type, components]) => {
      if (Array.isArray(components)) {
        instance.componentsByType![type] = components.filter(
          isConnectedPagefindComponent
        );
      }
    });
  }

  instance.reconcileAria?.();
};

const closestPagefindTrigger = (target: EventTarget | null) => {
  const targetWithClosest = target as {
    closest?: (selector: string) => Element | null;
  } | null;

  return targetWithClosest?.closest?.('pagefind-modal-trigger') ?? null;
};

const isEditableTarget = (target: EventTarget | null) => {
  const element = target as
    | {
        isContentEditable?: boolean;
        tagName?: string;
      }
    | null
    | undefined;
  const tagName = element?.tagName?.toUpperCase();

  return (
    element?.isContentEditable || tagName === 'INPUT' || tagName === 'TEXTAREA'
  );
};

const usesMetaAsModifier = (windowRef: PagefindWindow) => {
  const platform =
    windowRef.navigator?.platform || windowRef.navigator?.userAgent;

  return /mac|iphone|ipad|ipod/i.test(platform ?? '');
};

const isSearchShortcut = (event: KeyboardEvent, windowRef: PagefindWindow) => {
  if (
    event.key.toLowerCase() !== 'k' ||
    event.altKey ||
    event.shiftKey ||
    isEditableTarget(event.target)
  ) {
    return false;
  }

  return usesMetaAsModifier(windowRef)
    ? event.metaKey && !event.ctrlKey
    : event.ctrlKey && !event.metaKey;
};

const schedulePrune = (windowRef: PagefindWindow) => {
  const prune = () =>
    pruneDisconnectedPagefindComponents(windowRef.PagefindComponents);

  if (typeof windowRef.requestAnimationFrame === 'function') {
    windowRef.requestAnimationFrame(prune);
    return;
  }

  windowRef.setTimeout(prune, 0);
};

export const bindPagefindViewTransitionRefresh = (
  documentRef: Document,
  windowRef: PagefindWindow
) => {
  const refreshAfterTransition = () => schedulePrune(windowRef);
  const refreshBeforeTriggerClick = (event: Event) => {
    if (closestPagefindTrigger(event.target)) {
      pruneDisconnectedPagefindComponents(windowRef.PagefindComponents);
    }
  };
  const refreshBeforeShortcut = (event: KeyboardEvent) => {
    if (isSearchShortcut(event, windowRef)) {
      pruneDisconnectedPagefindComponents(windowRef.PagefindComponents);
    }
  };

  documentRef.addEventListener('astro:page-load', refreshAfterTransition);
  documentRef.addEventListener('astro:after-swap', refreshAfterTransition);
  documentRef.addEventListener('click', refreshBeforeTriggerClick, true);
  documentRef.addEventListener('keydown', refreshBeforeShortcut, true);
  refreshAfterTransition();

  return () => {
    documentRef.removeEventListener('astro:page-load', refreshAfterTransition);
    documentRef.removeEventListener('astro:after-swap', refreshAfterTransition);
    documentRef.removeEventListener('click', refreshBeforeTriggerClick, true);
    documentRef.removeEventListener('keydown', refreshBeforeShortcut, true);
  };
};

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  bindPagefindViewTransitionRefresh(document, window as PagefindWindow);
}
