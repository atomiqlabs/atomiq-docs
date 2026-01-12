# Pinggy tunnel

{% hint style="warning" %}
You only need to do this in case your machine running the LP node software doesn't have a static & public IP address accessible from the public internet. This is usually the case if you want to run the LP node at your home, which then runs in a local network and is not accessible from the outside world because of NAT.
{% endhint %}

Pinggy is a service which gives you a static public domain with the traffic tunneled directly to your server. You therefore don't need a public IP address when running the LP node and can run the LP node on home networks.

## Creating account

To use the pinggy tunnel you first need to create an account and then get the Pro subscription there (this costs $3 per month, with a free trial for 7 days)

Head over to [Pinggy website](https://dashboard.pinggy.io/register) and create an account there. Once registered go over to [subscriptions](https://dashboard.pinggy.io/subscriptions) and subscribe to the Pro plan.

## Tunnel setup

After registering the account and subscribing to the Pro subscription you need to head over to the [subdomains](https://dashboard.pinggy.io/subdomains). Copy the **Access token** & **Subdomain** from the page, should look like this:

<figure><img src="https://3413090771-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FQKYJLT6LdI5sTgcaMspD%2Fuploads%2FjTW8itmHxtfovcQPkdzi%2Fobr%C3%A1zok.png?alt=media&#x26;token=04eabbb4-edaa-43a2-911c-387e6a57bbdd" alt=""><figcaption></figcaption></figure>

So in this case the access token (*eCC...*) & subdomain (*zrgaulsdkx.a.pinggy.link*)

### Running the tunnel

We will now use the copied access token & subdomain to setup the tunnel on the LP node. The following command will run the tunnel inside a docker image (replace the *\<access token>* with your own access token copied in the previous step)

<pre class="language-bash"><code class="lang-bash">sudo docker run -d --restart=unless-stopped --net=host -t pinggy/pinggy -p 443 -R0:localhost:443 -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -t <a data-footnote-ref href="#user-content-fn-1">&#x3C;your access token from pinggy dashboard></a>+tls@pro.pinggy.io
</code></pre>

### LP configuration

We need to configure the LP node to use a different TLS challenge mechanism and also configure the correct subdomain to be used. To do so we edit the LP node's configuration - this is stored at `config/intermediary/config.yaml` (for mainnet) or `config-testnet/intermediary/config.yaml` (for testnet). Search for the `SSL_AUTO` section in the config, should look like this:

<pre class="language-yaml" data-title="config.yaml"><code class="lang-yaml"><strong>#Automatic SSL certificate provisioning config
</strong>SSL_AUTO:
  #HTTP listen port to list for ACME challenges
  HTTP_LISTEN_PORT: 80
  #DNS proxy to use - mapping the server's IP address to a domain
  DNS_PROXY: "nodes.atomiq.exchange"
</code></pre>

Replace the whole section with the following (be sure to copy in your subdomain you've got in the pinggy dashboard)

<pre class="language-yaml" data-title="config.yaml"><code class="lang-yaml">#Automatic SSL certificate provisioning config
SSL_AUTO:
  #Use different TLS challenge method
  ACME_METHOD: "tls-alpn-01"
  #DNS domain to use
  FULL_DNS_DOMAIN: "<a data-footnote-ref href="#user-content-fn-2">&#x3C;your subomain from pinggy dashboard></a>"
</code></pre>

***

After this you are done with the pinggy setup and can [continue the LP node setup](https://docs.atomiq.exchange/running-lp-node#installation).

[^1]: Replace with your access token

[^2]: Replace with your subdomain copied from the pinggy dashboard
