import{$ as T,D as Hd,Dt as eS,Et as dy,F as L$1,M as KS,Ut as ka,Wt as m,X as Rd,Xt as pT,Yt as p,Z as Rv,a as $g,ft as ZS,in as v,l as Ba}from"./chunk-Dcm-gtRL.js";import{H as ks,T as We,k as Ya,m as Ha,v as Kr,w as Us}from"./main-R5IAFM5M.js";var A=class t{messages=p(ks);error(o,e=`Something went wrong`){this.messages.add({severity:`error`,summary:e,detail:o,life:6e3})}warn(o,e=`Warning`){this.messages.add({severity:`warn`,summary:e,detail:o,life:6e3})}static ɵfac=function(e){return new(e||t)};static ɵprov=T({token:t,factory:t.ɵfac,providedIn:`root`})};var g=`http://localhost:3000`;var j=class t{http=p(Rv);getMenu(){return this.http.get(`${g}/menu`)}static ɵfac=function(e){return new(e||t)};static ɵprov=T({token:t,factory:t.ɵfac,providedIn:`root`})};var B=class t{http=p(Rv);ordersUrl=`${g}/orders`;getOrders(){return this.http.get(this.ordersUrl)}getOrder(o){return this.http.get(`${this.ordersUrl}/${encodeURIComponent(o)}`)}createOrder(o){return this.http.post(this.ordersUrl,o)}updateStatus(o,e){let n={status:e};return this.http.patch(`${this.ordersUrl}/${encodeURIComponent(o)}`,n)}static ɵfac=function(e){return new(e||t)};static ɵprov=T({token:t,factory:t.ɵfac,providedIn:`root`})};var F=`
    .p-skeleton {
        display: block;
        overflow: hidden;
        background: dt('skeleton.background');
        border-radius: dt('skeleton.border.radius');
    }

    .p-skeleton::after {
        content: '';
        animation: p-skeleton-animation 1.2s infinite;
        height: 100%;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        transform: translateX(-100%);
        z-index: 1;
        background: linear-gradient(90deg, rgba(255, 255, 255, 0), dt('skeleton.animation.background'), rgba(255, 255, 255, 0));
    }

    [dir='rtl'] .p-skeleton::after {
        animation-name: p-skeleton-animation-rtl;
    }

    .p-skeleton-circle {
        border-radius: 50%;
    }

    .p-skeleton-animation-none::after {
        animation: none;
    }

    @keyframes p-skeleton-animation {
        from {
            transform: translateX(-100%);
        }
        to {
            transform: translateX(100%);
        }
    }

    @keyframes p-skeleton-animation-rtl {
        from {
            transform: translateX(100%);
        }
        to {
            transform: translateX(-100%);
        }
    }
`;var $={root:{position:`relative`}};var _={root:({instance:t})=>[`p-skeleton p-component`,{"p-skeleton-circle":t.shape()===`circle`,"p-skeleton-animation-none":t.animation()===`none`}]};var U=class l extends We{name=`skeleton`;style=F;classes=_;inlineStyles=$;static ɵfac=(()=>{let e;return function(r){return(e||(e=$g(l)))(r||l)}})();static ɵprov=T({token:l,factory:l.ɵfac})};var L=new v(`SKELETON_INSTANCE`);var Oe=class d extends Ha{componentName=`Skeleton`;$pcSkeleton=p(L,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=p(Ya,{self:!0});shape=Ba(`rectangle`);animation=Ba(`wave`);borderRadius=Ba();size=Ba();width=Ba(`100%`);height=Ba(`1rem`);_componentStyle=p(U);containerStyle=Hd(()=>{let e=this._componentStyle?.inlineStyles.root,n=this.size(),r=this.width(),c=this.height(),p=this.borderRadius();if(!this.$unstyled())return n?L$1(m({},e),{width:n,height:n,borderRadius:p}):L$1(m({},e),{width:r,height:c,borderRadius:p})});dataP=Hd(()=>{let e=this.shape();return this.cn({[e]:e})});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms([`host`,`root`]))}static ɵfac=(()=>{let e;return function(r){return(e||(e=$g(d)))(r||d)}})();static ɵcmp=Rd({type:d,selectors:[[`p-skeleton`]],hostVars:6,hostBindings:function(n,r){n&2&&(ka(`aria-hidden`,!0)(`data-p`,r.dataP()),ZS(r.containerStyle()),KS(r.cx(`root`)))},inputs:{shape:[1,`shape`],animation:[1,`animation`],borderRadius:[1,`borderRadius`],size:[1,`size`],width:[1,`width`],height:[1,`height`]},features:[pT([U,{provide:L,useExisting:d},{provide:Kr,useExisting:d}]),eS([Ya]),dy],decls:0,vars:0,template:function(n,r){},dependencies:[Us],encapsulation:2})};var V=12;var X=14;function z(t){return Math.round(t*100)}function u(t){return t/100}function Pe(t){return`EGP ${t.toFixed(2)}`}function Te(t,o){let e=new Map(o.map(n=>[n.id,n]));return t.map(n=>{let r=e.get(n.menuId);return r?{menuId:n.menuId,name:r.name,qty:n.qty,note:n.note,unitPrice:r.price,lineTotal:u(z(r.price)*n.qty)}:{menuId:n.menuId,name:null,qty:n.qty,note:n.note,unitPrice:null,lineTotal:null}})}function Ce(t,o){let e=o.reduce((p,k)=>p+z(k.unitPrice)*k.qty,0),n=t===`dine-in`?Math.round(e*V/100):0,r=e+n,c=Math.round(r*X/100);return{subtotal:u(e),serviceCharge:u(n),vat:u(c),grandTotal:u(r+c)}}export{Pe as a,Oe as i,B as n,Te as o,Ce as r,j as s,A as t};