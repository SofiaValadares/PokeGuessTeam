import PlayerHandler from '../store/PlayerHandler.js';
import MatchHandler from '../store/MatchHandler.js';
import { initGamePage } from '../pages/game/game.js';
import { initHomePage } from '../pages/home/home.js';
import { initRegisterPage } from '../pages/register/register.js';
import { initTeamSelectionPage } from '../pages/teamSelection/teamSelection.js';

export const ROUTES = {
  register: 'register',
  home: 'home',
  teamMain: 'team-main',
  teamGuest: 'team-guest',
  game: 'game',
};

const ROUTE_LABELS = {
  [ROUTES.register]: 'Registro',
  [ROUTES.home]: 'Home',
  [ROUTES.teamMain]: 'Time principal',
  [ROUTES.teamGuest]: 'Time convidado',
  [ROUTES.game]: 'Partida',
};

function normalizeRoute(hashValue) {
  const cleanHash = (hashValue || '').replace(/^#\/?/, '').trim();
  const [rawRoute = '', ...rawSegments] = cleanHash.split('/').filter(Boolean);
  const routeName = rawRoute.toLowerCase();

  if (!Object.values(ROUTES).includes(routeName)) {
    return null;
  }

  return {
    routeName,
    pathSegments: rawSegments.map(segment => decodeURIComponent(segment)),
  };
}

export function navigateTo(routeName, pathSegments = []) {
  const routePath = [routeName, ...pathSegments.map(segment => encodeURIComponent(String(segment ?? '').trim()))]
    .filter(Boolean)
    .join('/');

  window.location.hash = `#/${routePath}`;
}

export async function initSectionManager(pokedexElement) {
  const playerHandler = new PlayerHandler();
  const matchHandler = new MatchHandler();
  const routeButtons = Array.from(pokedexElement.querySelectorAll('[data-route-link]'));
  const currentRouteLabel = pokedexElement.querySelector('#pokedexCurrentRouteLabel');
  let cleanupCurrentPage = null;

  const renderers = {
    [ROUTES.register]: initRegisterPage,
    [ROUTES.home]: initHomePage,
    [ROUTES.teamMain]: initTeamSelectionPage,
    [ROUTES.teamGuest]: initTeamSelectionPage,
    [ROUTES.game]: initGamePage,
  };

  function canAccessRoute(routeName) {
    const currentMatch = matchHandler.getMatch();

    if (routeName === ROUTES.register) {
      return true;
    }

    if (routeName === ROUTES.home) {
      return playerHandler.hasPlayer();
    }

    if (routeName === ROUTES.teamMain) {
      return playerHandler.hasPlayer();
    }

    if (routeName === ROUTES.teamGuest) {
      return Boolean(playerHandler.hasPlayer() && currentMatch && currentMatch.phase === 'team-guest');
    }

    if (routeName === ROUTES.game) {
      return Boolean(playerHandler.hasPlayer() && currentMatch && currentMatch.phase === 'active' && currentMatch.status !== 'finished');
    }

    return false;
  }

  function refreshNavigation(activeRoute) {
    routeButtons.forEach(button => {
      const routeName = button.dataset.routeLink;
      const enabled = canAccessRoute(routeName);

      button.disabled = !enabled;
      button.classList.toggle('is-active', routeName === activeRoute);
    });

    if (currentRouteLabel) {
      currentRouteLabel.textContent = ROUTE_LABELS[activeRoute] ?? 'Registro';
    }
  }

  async function renderRoute() {
    const routeState = normalizeRoute(window.location.hash);
    const defaultRoute = playerHandler.hasPlayer() ? ROUTES.home : ROUTES.register;
    const nextRoute = routeState?.routeName ?? defaultRoute;
    const nextPathSegments = routeState?.pathSegments ?? [];

    if (!canAccessRoute(nextRoute)) {
		navigateTo(defaultRoute);
      return;
    }

    const expectedHash = `#/${[nextRoute, ...nextPathSegments.map(segment => encodeURIComponent(segment))].join('/')}`;

    if (window.location.hash !== expectedHash) {
      window.location.hash = expectedHash;
      return;
    }

    refreshNavigation(nextRoute);

    const renderPage = renderers[nextRoute];

    if (!renderPage) {
      navigateTo(defaultRoute);
      return;
    }

    if (typeof cleanupCurrentPage === 'function') {
      cleanupCurrentPage();
      cleanupCurrentPage = null;
    }

    const routeResult = await renderPage(pokedexElement, {
      route: nextRoute,
      pathSegments: nextPathSegments,
      navigateTo,
      refresh: renderRoute,
      refreshNavigation: () => refreshNavigation(nextRoute),
      playerHandler,
    });

    if (typeof routeResult?.cleanup === 'function') {
      cleanupCurrentPage = routeResult.cleanup;
    }
  }

  routeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const routeName = button.dataset.routeLink;
      const defaultRoute = playerHandler.hasPlayer() ? ROUTES.home : ROUTES.register;

      if (!canAccessRoute(routeName)) {
		navigateTo(defaultRoute);
        return;
      }

      navigateTo(routeName);
    });
  });

  window.addEventListener('hashchange', renderRoute);
  await renderRoute();
}
