"""Okta OAuth Views"""
from typing import Any

from authentik.sources.oauth.models import OAuthSource
from authentik.sources.oauth.types.azure_ad import AzureADClient
from authentik.sources.oauth.types.manager import MANAGER, SourceType
from authentik.sources.oauth.views.callback import OAuthCallback
from authentik.sources.oauth.views.redirect import OAuthRedirect


class OktaOAuthRedirect(OAuthRedirect):
    """Okta OAuth2 Redirect"""

    def get_additional_parameters(self, source: OAuthSource):  # pragma: no cover
        return {
            "scope": ["openid", "email", "profile"],
        }


class OktaOAuth2Callback(OAuthCallback):
    """Okta OAuth2 Callback"""

    # Okta has the same quirk as azure and throws an error if the access token
    # is set via query parameter, so we re-use the azure client
    # see https://github.com/goauthentik/authentik/issues/1910
    client_class = AzureADClient

    def get_user_id(self, info: dict[str, str]) -> str:
        return info.get("sub", "")

    def get_user_enroll_context(
        self,
        info: dict[str, Any],
    ) -> dict[str, Any]:
        return {
            "username": info.get("nickname"),
            "email": info.get("email"),
            "name": info.get("name"),
        }


@MANAGER.type()
class OktaType(SourceType):
    """Okta Type definition"""

    callback_view = OktaOAuth2Callback
    redirect_view = OktaOAuthRedirect
    name = "Okta"
    slug = "okta"

    urls_customizable = True
