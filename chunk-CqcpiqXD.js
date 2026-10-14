import{B as Td,Et as m,G as Wb,H as Ug,L as Ra,Lt as v,Nt as sT,U as VS,a as ke,bt as jd,i as ea,k as L$1,kt as p,n as Ks,o as zr,r as _r,s as $S,t as Kr,w as Iv,xt as jt,y as Fa,yt as iy,z as T}from"./main-WTPDCH6H.js";var g=`http://localhost:3000`;var j=class n{http=p(Iv);getMenu(){return this.http.get(`${g}/menu`)}static ɵfac=function(e){return new(e||n)};static ɵprov=T({token:n,factory:n.ɵfac,providedIn:`root`})};var B=class n{http=p(Iv);ordersUrl=`${g}/orders`;getOrders(r){let e=r?new jt().set(`status`,r):void 0;return this.http.get(this.ordersUrl,{params:e})}getOrder(r){return this.http.get(`${this.ordersUrl}/${encodeURIComponent(r)}`)}createOrder(r){return this.http.post(this.ordersUrl,r)}updateStatus(r,e){let t={status:e};return this.http.patch(`${this.ordersUrl}/${encodeURIComponent(r)}`,t)}static ɵfac=function(e){return new(e||n)};static ɵprov=T({token:n,factory:n.ɵfac,providedIn:`root`})};var F=class n{messages=p(Kr);error(r,e=`Something went wrong`){this.messages.add({severity:`error`,summary:e,detail:r,life:6e3})}warn(r,e=`Warning`){this.messages.add({severity:`warn`,summary:e,detail:r,life:6e3})}static ɵfac=function(e){return new(e||n)};static ɵprov=T({token:n,factory:n.ɵfac,providedIn:`root`})};var U=`
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
`;var _={root:{position:`relative`}};var V={root:({instance:n})=>[`p-skeleton p-component`,{"p-skeleton-circle":n.shape()===`circle`,"p-skeleton-animation-none":n.animation()===`none`}]};var L=class l extends ke{name=`skeleton`;style=U;classes=V;inlineStyles=_;static ɵfac=(()=>{let e;return function(o){return(e||(e=Ug(l)))(o||l)}})();static ɵprov=T({token:l,factory:l.ɵfac})};var z=new v(`SKELETON_INSTANCE`);var Ee=class d extends Ks{componentName=`Skeleton`;$pcSkeleton=p(z,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=p(ea,{self:!0});shape=Fa(`rectangle`);animation=Fa(`wave`);borderRadius=Fa();size=Fa();width=Fa(`100%`);height=Fa(`1rem`);_componentStyle=p(L);containerStyle=jd(()=>{let e=this._componentStyle?.inlineStyles.root,t=this.size(),o=this.width(),c=this.height(),p=this.borderRadius();if(!this.$unstyled())return t?L$1(m({},e),{width:t,height:t,borderRadius:p}):L$1(m({},e),{width:o,height:c,borderRadius:p})});dataP=jd(()=>{let e=this.shape();return this.cn({[e]:e})});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms([`host`,`root`]))}static ɵfac=(()=>{let e;return function(o){return(e||(e=Ug(d)))(o||d)}})();static ɵcmp=Td({type:d,selectors:[[`p-skeleton`]],hostVars:6,hostBindings:function(t,o){t&2&&(Ra(`aria-hidden`,!0)(`data-p`,o.dataP()),VS(o.containerStyle()),$S(o.cx(`root`)))},inputs:{shape:[1,`shape`],animation:[1,`animation`],borderRadius:[1,`borderRadius`],size:[1,`size`],width:[1,`width`],height:[1,`height`]},features:[sT([L,{provide:z,useExisting:d},{provide:_r,useExisting:d}]),Wb([ea]),iy],decls:0,vars:0,template:function(t,o){},dependencies:[zr],encapsulation:2})};var H=12;var X=14;function $(n){return Math.round(n*100)}function u(n){return n/100}function Te(n,r){let e=new Map(r.map(t=>[t.id,t]));return n.map(t=>{let o=e.get(t.menuId);return o?{menuId:t.menuId,name:o.name,qty:t.qty,note:t.note,unitPrice:o.price,lineTotal:u($(o.price)*t.qty)}:{menuId:t.menuId,name:null,qty:t.qty,note:t.note,unitPrice:null,lineTotal:null}})}function Ce(n,r){let e=r.reduce((p,k)=>p+$(k.unitPrice)*k.qty,0),t=n===`dine-in`?Math.round(e*H/100):0,o=e+t,c=Math.round(o*X/100);return{subtotal:u(e),serviceCharge:u(t),vat:u(c),grandTotal:u(o+c)}}export{Te as a,F as i,Ce as n,j as o,Ee as r,B as t};