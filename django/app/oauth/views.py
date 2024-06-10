from django.shortcuts import render, redirect

from django.conf import settings
import requests

# os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'  # Permettre HTTP en développement


def oauth_login(request):
    auth_url = f"{settings.AUTHORIZATION_URL}?client_id={settings.CLIENT_ID}&redirect_uri={settings.REDIRECT_URI}&response_type=code"
    return redirect(auth_url)

def oauth_callback(request):
    code = request.GET.get('code')
    if not code:
        return render(request, 'oauth/error.html', {'error': 'No code provided'})
    token_url = settings.TOKEN_URL
    token_data = {
        'grant_type': 'authorization_code',
        'client_id': settings.CLIENT_ID,
        'client_secret': settings.CLIENT_SECRET,
        'code': code,
        'redirect_uri': settings.REDIRECT_URI,
    }
    token_response = requests.post(token_url, data=token_data)
    token_json = token_response.json()
    access_token = token_json.get('access_token')

    user_info = requests.get('https://api.intra.42.fr/v2/me', headers={'Authorization': f'Bearer {access_token}'}).json()
    
    # Vous pouvez ensuite créer ou mettre à jour l'utilisateur dans votre base de données
    # Par exemple:
    # user, created = User.objects.get_or_create(username=user_info['login'])
    # user.access_token = access_token
    # user.save()
    
    return render(request, 'oauth/callback.html', {'user_info': user_info})


# def login(request):
#     oauth = OAuth2Session(settings.OAUTH2_CLIENT_ID, redirect_uri=settings.OAUTH2_REDIRECT_URI)
#     authorization_url, state = oauth.authorization_url(settings.OAUTH2_AUTHORIZE_URL)

#     # State is used to prevent CSRF, keep this for later.
#     request.session['oauth_state'] = state
#     # return redirect(authorization_url)
#     return HttpResponse(f'Authorization URL: <a href="{authorization_url}">{authorization_url}</a><br>State: {state}')

# def callback(request):
#     oauth = OAuth2Session(settings.OAUTH2_CLIENT_ID, state=request.session['oauth_state'], redirect_uri=settings.OAUTH2_REDIRECT_URI)
#     try:
#         token = oauth.fetch_token(settings.OAUTH2_TOKEN_URL, client_secret=settings.OAUTH2_CLIENT_SECRET, authorization_response=request.build_absolute_uri())
#         request.session['oauth_token'] = token
#         return HttpResponse('Authentication successful')
#     except Exception as e:
#          return HttpResponse(f'ERROR: {str(e)}<br>State sent: {request.session.get("oauth_state")}<br>State received: {request.GET.get("state")}')
