// Library Imports
import Vue from 'vue';
import VueResource from 'vue-resource';
import MDL from 'material-design-lite/material';
require('waypoints/lib/noframework.waypoints');

// Vue Plugin
Vue.use(VueResource);

// Vue.js Instance
new Vue({
  el: '#islamfactcheck',
  data: {
  	infos: [],
    pageTitleEl: '',
    printAssertion: '',
    currentCategory: '',
    printLink: '',
    printAll: false,
    isMobile: false,
    printSingle: false,
    isModalVisible: false
  },
  ready: function() {
    this.pageTitleEl = document.getElementById('page-title');
    this.pageTitleEl.innerText = 'Islam Fact Check';
    let hash = window.location.hash || '#';
    this.$http.get('data.json')
      .then((res) => {
        this.infos = res.data;
        this.createWaypoint("islam-fact-check", true);
        setTimeout(() => {
          for(let i in this.infos) {
            this.createWaypoint(this.infos[i].categoryId, false, this.infos[i].category);
            for(let j in this.infos[i].data) {
              let id = this.infos[i].data[j].id;
              this.createWaypoint(id, false);
              let factEl = document.getElementById(this.infos[i].data[j].factid);
              let factElPrint = document.getElementById(this.infos[i].data[j].factid+'print');
              let factElHidden = document.getElementById(this.infos[i].data[j].factid+'hidden');
              factEl.innerHTML = this.infos[i].data[j].fact.replace('FACT:', '');
              factEl.innerHTML = factEl.innerHTML.substring(0, this.infos[i].data[j].cutoffPoint);
              factElHidden.innerHTML = this.infos[i].data[j].fact.replace('FACT:', '');
              factElPrint.innerHTML = this.infos[i].data[j].fact;
              // let inPageLink = encodeURIComponent(`http://perceptionmgt.com/projects/ifc/#${id}`);
              // this.$http.get(`https://api-ssl.bitly.com/v3/shorten?access_token=b30f7be0c9aee687f8410b27d14a9afd4a6d5cdf&longUrl=${inPageLink}`)
              //   .then((res) => {
              //      this.infos[i].data[j].inPageLink = res.data.data.url;
              //   });
            }
          }
          window.onresize = function() {
            Waypoint.refreshAll();
          }
        }, 500);
        window.onload = function () {
          window.location = hash;
        }
        if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
          this.isMobile = true;
        }
      });
  },
  methods: {
    hideOverlay: function() {
      document.getElementsByClassName('mdl-layout__obfuscator')[0].classList.remove('is-visible');
      document.getElementsByClassName('mdl-layout__drawer')[0].classList.remove('is-visible');
    },
    gotoCategory: function(categoryId) {
      window.location.hash = categoryId;
      this.hideOverlay();
    },
    toggleMoreText: function(showMore) {
      setTimeout(()=> Waypoint.refreshAll(), 10);
      return !showMore;
    },
    createWaypoint: function(id, removeHash, category) {
      let self = this;
      new Waypoint({
        element: document.getElementById(id),
        handler: function() {
          if(category) self.pageTitleEl.innerText = category;
          self.currentCategory = category ? self.pageTitleEl.innerText : removeHash ? "" : self.currentCategory;
          if(history.replaceState) {
            history.replaceState(null, null, removeHash ? '#' : '#' + id);
          } else {
            window.location.hash = removeHash ? "" : id;
          }
        },
        context: document.getElementsByClassName('mdl-layout__content')[0]
      });
    },
    share: function(shareTo, data) {
      let tempEl = document.createElement('div');
      tempEl.innerHTML = data.fact;
      data.fact = tempEl.innerText;
      let text = `Assertion: ${data.assertion}\n\r${data.fact}`;
      if(shareTo === 'Facebook') {
        this.shareViaFacebook(data.inPageLink, data.subject, data.fact, `http://islamfactcheck.org/img/${data.factid}.jpg`);
      } else if(shareTo === 'Twitter') {
        this.shareViaTwitter(`${data.twitterMsg}`, data.inPageLink);
      } else if(shareTo === 'WhatsApp') {
        this.shareViaWhatsApp(`${text}`, data.inPageLink);
      } else if(shareTo === 'Mail') {
        let subject = encodeURIComponent(data.subject);
        let body = encodeURIComponent(`I saw this on Islam Fact Check and though you might like it.\n\r${text}`).substr(0, 1500);
        body += encodeURIComponent(`...\n\rRead more at ${data.inPageLink}\n\rThanks!`);
        this.shareViaMail(subject, body);
      }
    },
    shareViaFacebook(link, name='', description='', picture='') {
        FB.ui({
          method: 'feed',
          link: link,
          name: name,
          description: description,
          picture: picture
        }, function(response){});
        this.hideOverlay();
    },
    shareViaTwitter(text, link) {
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${link}`, 'littleWindow', 'location=no,width=480,height=360');
      this.hideOverlay();
    },
    shareViaWhatsApp(text, link) {
      window.location = `whatsapp://send?text=${encodeURIComponent(text)}Link: ${link}`;
      this.hideOverlay();
    },
    shareViaMail(subject, body) {
      //body = encodeURIComponent(body);
      window.location = `mailto:?subject=${subject}&body=${body}`;
      this.hideOverlay();
    },
    print: function(data) {
      if(data === undefined) {
        this.printAll = true;
        let currentPageTitle = this.pageTitleEl.innerText;
        setTimeout(()=> {
          window.print();
          this.printAll = false;
          this.pageTitleEl.innerText = currentPageTitle;
        }, 100);
      } else {
        this.printAssertion = data.assertion;
        this.printLink = data.inPageLink;
        document.getElementById('printSingleFact').innerHTML = data.fact;
        this.printSingle = true;
        setTimeout(()=> {
          window.print();
          this.printSingle = false;
        }, 100);
      }
      this.hideOverlay();
    }
  }
});
