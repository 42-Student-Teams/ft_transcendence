import btnLogo from "../../assets/image/42-logo.png";
import Component from "../../library/component.js";

export default class Login extends Component {
	constructor() {
		super({ element: document.getElementById("btnAuth0") });
		this.myfunc = this.myfunc.bind(this);
		this.render();
	}

	myfunc () {
		alert('lol lmao');
	}

	async render() {
		const view = /*html*/ `
            <!--<a href="${process.env.WEBSITE_URL}" class="btn btn-md btn-fortytwo w-100 fs-5">-->
            <a class="btn btn-md btn-fortytwo w-100 fs-5" onclick="
            	
            	//alert('${process.env.API_URL}');
            	

				const params = { client_id: '${process.env.CLIENT_ID}',
					redirect_uri: '${process.env.REDIRECT_URI}',
					state: 'dbwifbibf',
					response_type: 'code'
                };
                let query = Object.keys(params)
				 .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
				 .join('&');
				
				let url = '/api/oauth/authorize' + query;
                
                console.log(url);
                
                fetch(url, {
				  method: 'GET',
				  headers: {
					'Content-Type': 'application/json'
				  },
				  redirect: 'follow'
				})
				.then(response => {
                    console.log(response.headers.get('Content-Type'));
                    console.log(response.text().then(data => console.log(data)));
				  if (response.redirected) {
					// If the response is a redirect, log the redirected URL
					console.log('Redirected to:', response.url);
				  }
				  //return response.json();
				})
				//.then(data => console.log(data))
				//.catch(error => console.error('Error:', error));

                
				/*try {
					const response = fetch(url);
                    console.log(response);
					if (!response.ok) {
						throw new Error('Network response was not ok ' + response.statusText);
					}
					const data = response.json();
					console.log(data);
				} catch (error) {
					console.error('There has been a problem with your fetch operation:', error);
				}*/
            
            ">
                <img src=${btnLogo} style="width:20px" class="me-2">
                Sign In with 42
			</a>
			
        `;
		this.element = document.getElementById("btnAuth0");
		this.element.innerHTML = view;
	}
}
