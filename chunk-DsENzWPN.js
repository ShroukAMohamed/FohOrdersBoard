import{$ as Vd,A as Mv,B as QS,D as L$1,Dt as hT,F as Oa,K as T,Lt as ly,M as Nd,Q as Ut,Rt as m,T as Jb,Wt as p,X as Ua,nn as v,ot as YS,w as Hg}from"./chunk-B5UdPHvh.js";import{H as ks,T as We,k as Ya,m as Ha,v as Kr,w as Us}from"./main-SNLR54WW.js";var g=`http://localhost:3000`;var j=class t{http=p(Mv);getMenu(){return this.http.get(`${g}/menu`)}static ɵfac=function(e){return new(e||t)};static ɵprov=T({token:t,factory:t.ɵfac,providedIn:`root`})};var B=class t{http=p(Mv);ordersUrl=`${g}/orders`;getOrders(r){let e=r?new Ut().set(`status`,r):void 0;return this.http.get(this.ordersUrl,{params:e})}getOrder(r){return this.http.get(`${this.ordersUrl}/${encodeURIComponent(r)}`)}createOrder(r){return this.http.post(this.ordersUrl,r)}updateStatus(r,e){let n={status:e};return this.http.patch(`${this.ordersUrl}/${encodeURIComponent(r)}`,n)}static ɵfac=function(e){return new(e||t)};static ɵprov=T({token:t,factory:t.ɵfac,providedIn:`root`})};var F=class t{messages=p(ks);error(r,e=`Something went wrong`){this.messages.add({severity:`error`,summary:e,detail:r,life:6e3})}warn(r,e=`Warning`){this.messages.add({severity:`warn`,summary:e,detail:r,life:6e3})}static ɵfac=function(e){return new(e||t)};static ɵprov=T({token:t,factory:t.ɵfac,providedIn:`root`})};var U=`
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
`;var _={root:{position:`relative`}};var V={root:({instance:t})=>[`p-skeleton p-component`,{"p-skeleton-circle":t.shape()===`circle`,"p-skeleton-animation-none":t.animation()===`none`}]};var L=class l extends We{name=`skeleton`;style=U;classes=V;inlineStyles=_;static ɵfac=(()=>{let e;return function(o){return(e||(e=Hg(l)))(o||l)}})();static ɵprov=T({token:l,factory:l.ɵfac})};var z=new v(`SKELETON_INSTANCE`);var Ee=class d extends Ha{componentName=`Skeleton`;$pcSkeleton=p(z,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=p(Ya,{self:!0});shape=Ua(`rectangle`);animation=Ua(`wave`);borderRadius=Ua();size=Ua();width=Ua(`100%`);height=Ua(`1rem`);_componentStyle=p(L);containerStyle=Vd(()=>{let e=this._componentStyle?.inlineStyles.root,n=this.size(),o=this.width(),c=this.height(),p=this.borderRadius();if(!this.$unstyled())return n?L$1(m({},e),{width:n,height:n,borderRadius:p}):L$1(m({},e),{width:o,height:c,borderRadius:p})});dataP=Vd(()=>{let e=this.shape();return this.cn({[e]:e})});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms([`host`,`root`]))}static ɵfac=(()=>{let e;return function(o){return(e||(e=Hg(d)))(o||d)}})();static ɵcmp=Nd({type:d,selectors:[[`p-skeleton`]],hostVars:6,hostBindings:function(n,o){n&2&&(Oa(`aria-hidden`,!0)(`data-p`,o.dataP()),YS(o.containerStyle()),QS(o.cx(`root`)))},inputs:{shape:[1,`shape`],animation:[1,`animation`],borderRadius:[1,`borderRadius`],size:[1,`size`],width:[1,`width`],height:[1,`height`]},features:[hT([L,{provide:z,useExisting:d},{provide:Kr,useExisting:d}]),Jb([Ya]),ly],decls:0,vars:0,template:function(n,o){},dependencies:[Us],encapsulation:2})};var H=12;var X=14;function $(t){return Math.round(t*100)}function u(t){return t/100}function Te(t){return`EGP ${t.toFixed(2)}`}function Ce(t,r){let e=new Map(r.map(n=>[n.id,n]));return t.map(n=>{let o=e.get(n.menuId);return o?{menuId:n.menuId,name:o.name,qty:n.qty,note:n.note,unitPrice:o.price,lineTotal:u($(o.price)*n.qty)}:{menuId:n.menuId,name:null,qty:n.qty,note:n.note,unitPrice:null,lineTotal:null}})}function we(t,r){let e=r.reduce((p,k)=>p+$(k.unitPrice)*k.qty,0),n=t===`dine-in`?Math.round(e*H/100):0,o=e+n,c=Math.round(o*X/100);return{subtotal:u(e),serviceCharge:u(n),vat:u(c),grandTotal:u(o+c)}}export{Te as a,F as i,Ce as n,j as o,Ee as r,we as s,B as t};