/* Interactive illustrated wall mirror, with four-corner perspective calibration.
   Works in the same 1670 x 942 room coordinates as the poster editor.
   The user's mirror artwork stays in its separate SVG asset. */
(function () {
  'use strict';
  const svg = document.getElementById('hotspots');
  if (!svg || document.getElementById('nana-wall-mirror')) return;

  const NS = 'http://www.w3.org/2000/svg';
  const W = 550, H = 542;
  const roomW = 1670, roomH = 942;
  const key = 'nana-wall-mirror-perspective-v1';
  const editing = new URLSearchParams(location.search).get('posterEdit') === '1';
  // Coordinates approved by the artist, in the 1670 × 942 room grid.
  const defaultQuad = [[1322.9421302303758,212.60360032394615],[1434.095914604014,201.2034456191082],[1438.4527009202245,315.53787883400656],[1322.9421302303758,325.7088107239462]];

  const fromRect = (x, y, width) => {
    const height = width * H / W;
    return [[x,y],[x+width,y],[x+width,y+height],[x,y+height]];
  };
  const copy = points => points.map(p => [p[0], p[1]]);
  const valid = points =>
    Array.isArray(points) && points.length === 4 &&
    points.every(p => Array.isArray(p) && p.length === 2 &&
      p.every(n => Number.isFinite(n) && Math.abs(n) < 10000));

  const state = { quad: copy(defaultQuad) };
  try {
    // Later adjustments in the same browser take precedence over the approved default.
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved && valid(saved.quad)) state.quad = copy(saved.quad);
  } catch (_) { /* Private browsing may restrict storage. */ }
  const store = () => {
    try { localStorage.setItem(key,JSON.stringify({quad:state.quad})); } catch (_) {}
  };
  function make(tag,attrs) {
    const el = document.createElementNS(NS,tag);
    for (const [k,v] of Object.entries(attrs || {})) el.setAttribute(k,String(v));
    return el;
  }
  function pointsToString(points) { return points.map(p=>p.join(',')).join(' '); }
  function center(points) {
    return [
      points.reduce((sum,p)=>sum+p[0],0)/4,
      points.reduce((sum,p)=>sum+p[1],0)/4
    ];
  }
  // Bilinear positioning for the click region. The artwork itself is split
  // into two affine triangles to respect the four independently moved corners.
  function interp(p,u,v) {
    const weights = [(1-u)*(1-v),u*(1-v),u*v,(1-u)*v];
    return [
      p.reduce((sum,point,i)=>sum+point[0]*weights[i],0),
      p.reduce((sum,point,i)=>sum+point[1]*weights[i],0)
    ];
  }

  const group = make('g',{id:'nana-wall-mirror','data-wall-decoration':'mirror'});
  const defs = make('defs');
  const visual = make('g',{'pointer-events':'none'});
  // Original asset paths, mapped continuously to all four calibrated corners.
  // A single surface avoids the diagonal seam from clipped image triangles.
  const artwork = [{"fill":"#ff001e","points":[[261.0,0.0],[254.0,2.0],[237.0,12.0],[229.0,14.0],[215.0,12.0],[188.0,13.0],[180.0,18.0],[163.0,35.0],[159.0,37.0],[136.0,39.0],[128.0,42.0],[124.0,46.0],[110.0,68.0],[103.0,75.0],[84.0,81.0],[71.0,91.0],[68.0,98.0],[67.0,106.0],[60.0,120.0],[42.0,133.0],[35.0,142.0],[28.0,180.0],[17.0,194.0],[12.0,207.0],[11.0,225.0],[13.0,229.0],[13.0,235.0],[5.0,251.0],[1.0,263.0],[0.0,280.0],[2.0,288.0],[13.0,303.0],[15.0,309.0],[14.0,324.0],[11.0,333.0],[11.0,345.0],[15.0,352.0],[24.0,360.0],[33.0,372.0],[35.0,379.0],[33.0,398.0],[37.0,410.0],[46.0,422.0],[62.0,426.0],[68.0,431.0],[74.0,445.0],[76.0,456.0],[82.0,463.0],[89.0,466.0],[107.0,468.0],[113.0,471.0],[118.0,477.0],[126.0,482.0],[129.0,488.0],[137.0,496.0],[151.0,506.0],[172.0,507.0],[182.0,510.0],[189.0,517.0],[194.0,525.0],[205.0,534.0],[223.0,536.0],[244.0,528.0],[250.0,528.0],[261.0,533.0],[264.0,533.0],[275.0,539.0],[281.0,541.0],[288.0,541.0],[295.0,535.0],[318.0,522.0],[334.0,524.0],[339.0,526.0],[365.0,525.0],[376.0,514.0],[384.0,510.0],[388.0,505.0],[404.0,504.0],[411.0,501.0],[417.0,501.0],[423.0,498.0],[428.0,492.0],[434.0,478.0],[444.0,468.0],[450.0,466.0],[458.0,466.0],[469.0,461.0],[481.0,436.0],[482.0,425.0],[486.0,417.0],[491.0,412.0],[511.0,403.0],[518.0,395.0],[518.0,362.0],[530.0,347.0],[540.0,330.0],[540.0,319.0],[532.0,302.0],[532.0,291.0],[539.0,271.0],[547.0,263.0],[549.0,253.0],[544.0,236.0],[532.0,225.0],[530.0,221.0],[530.0,207.0],[534.0,196.0],[534.0,188.0],[531.0,183.0],[519.0,173.0],[511.0,163.0],[505.0,147.0],[507.0,135.0],[504.0,125.0],[495.0,116.0],[473.0,105.0],[470.0,102.0],[469.0,90.0],[463.0,75.0],[449.0,66.0],[440.0,65.0],[427.0,61.0],[418.0,52.0],[412.0,38.0],[407.0,32.0],[394.0,28.0],[364.0,28.0],[358.0,24.0],[346.0,10.0],[337.0,5.0],[324.0,4.0],[304.0,12.0],[298.0,13.0],[275.0,2.0]]},{"fill":"#e3f7ff","points":[[263.0,33.0],[235.0,45.0],[224.0,46.0],[218.0,44.0],[209.0,44.0],[198.0,49.0],[194.0,54.0],[180.0,63.0],[153.0,66.0],[139.0,76.0],[136.0,84.0],[128.0,94.0],[115.0,102.0],[101.0,107.0],[97.0,111.0],[87.0,139.0],[65.0,159.0],[60.0,167.0],[58.0,197.0],[51.0,208.0],[44.0,214.0],[40.0,222.0],[39.0,236.0],[43.0,253.0],[43.0,261.0],[36.0,278.0],[36.0,292.0],[46.0,311.0],[46.0,323.0],[44.0,332.0],[45.0,342.0],[50.0,351.0],[54.0,354.0],[54.0,356.0],[62.0,366.0],[68.0,394.0],[72.0,401.0],[93.0,419.0],[100.0,430.0],[103.0,441.0],[107.0,445.0],[143.0,465.0],[160.0,483.0],[176.0,489.0],[195.0,491.0],[214.0,504.0],[228.0,506.0],[242.0,500.0],[253.0,500.0],[274.0,508.0],[287.0,509.0],[297.0,506.0],[305.0,500.0],[313.0,497.0],[326.0,497.0],[336.0,499.0],[346.0,498.0],[370.0,481.0],[395.0,477.0],[406.0,468.0],[411.0,459.0],[420.0,449.0],[443.0,440.0],[449.0,434.0],[461.0,406.0],[483.0,385.0],[489.0,373.0],[489.0,357.0],[492.0,348.0],[501.0,334.0],[507.0,320.0],[508.0,315.0],[504.0,303.0],[504.0,294.0],[511.0,271.0],[513.0,269.0],[514.0,260.0],[508.0,238.0],[502.0,228.0],[502.0,198.0],[482.0,174.0],[480.0,166.0],[480.0,155.0],[477.0,145.0],[470.0,138.0],[463.0,135.0],[454.0,125.0],[444.0,101.0],[436.0,92.0],[429.0,88.0],[415.0,87.0],[402.0,82.0],[394.0,74.0],[389.0,65.0],[380.0,58.0],[351.0,56.0],[327.0,39.0],[313.0,38.0],[306.0,41.0],[295.0,42.0],[290.0,41.0],[275.0,33.0]]},{"fill":"#fff","points":[[384.0,60.0],[375.0,57.0],[354.0,57.0],[345.0,53.0],[342.0,50.0],[343.0,52.0],[321.0,83.0],[321.0,86.0],[313.0,100.0],[303.0,112.0],[289.0,134.0],[256.0,195.0],[240.0,219.0],[236.0,228.0],[220.0,255.0],[204.0,291.0],[186.0,322.0],[152.0,388.0],[140.0,407.0],[126.0,436.0],[123.0,444.0],[124.0,447.0],[123.0,448.0],[121.0,447.0],[122.0,448.0],[119.0,451.0],[143.0,465.0],[160.0,483.0],[176.0,489.0],[182.0,489.0],[180.0,487.0],[187.0,469.0],[201.0,442.0],[216.0,404.0],[225.0,389.0],[238.0,354.0],[259.0,312.0],[264.0,298.0],[267.0,294.0],[267.0,291.0],[269.0,289.0],[279.0,265.0],[284.0,257.0],[285.0,252.0],[292.0,238.0],[298.0,230.0],[302.0,221.0],[313.0,204.0],[317.0,192.0],[323.0,183.0],[323.0,181.0],[336.0,161.0],[341.0,150.0],[351.0,134.0],[352.0,130.0],[360.0,119.0],[368.0,101.0],[372.0,96.0],[373.0,91.0],[386.0,67.0],[387.0,63.0]]},{"fill":"#fff","points":[[294.0,41.0],[290.0,41.0],[275.0,33.0],[272.0,34.0],[263.0,33.0],[258.0,34.0],[239.0,44.0],[236.0,44.0],[233.0,51.0],[227.0,56.0],[215.0,74.0],[205.0,86.0],[200.0,97.0],[193.0,107.0],[185.0,122.0],[168.0,145.0],[168.0,147.0],[148.0,179.0],[146.0,185.0],[139.0,196.0],[139.0,198.0],[130.0,215.0],[127.0,218.0],[126.0,222.0],[114.0,244.0],[104.0,258.0],[101.0,265.0],[96.0,271.0],[87.0,287.0],[82.0,293.0],[74.0,308.0],[62.0,325.0],[49.0,349.0],[48.0,348.0],[54.0,354.0],[54.0,356.0],[57.0,358.0],[62.0,366.0],[68.0,394.0],[75.0,404.0],[74.0,403.0],[86.0,383.0],[88.0,376.0],[98.0,355.0],[116.0,330.0],[137.0,297.0],[141.0,287.0],[148.0,276.0],[148.0,274.0],[156.0,262.0],[158.0,256.0],[162.0,251.0],[173.0,231.0],[177.0,227.0],[191.0,205.0],[215.0,174.0],[215.0,172.0],[219.0,167.0],[227.0,152.0],[230.0,149.0],[239.0,129.0],[247.0,115.0],[247.0,113.0],[252.0,106.0],[252.0,104.0],[261.0,92.0],[271.0,75.0],[273.0,74.0],[283.0,60.0],[283.0,58.0],[293.0,44.0],[292.0,43.0]]},{"fill":"#ffb0bc","points":[[160.0,50.0],[159.0,49.0],[153.0,49.0],[152.0,50.0],[143.0,51.0],[142.0,52.0],[138.0,53.0],[130.0,61.0],[130.0,62.0],[123.0,69.0],[123.0,70.0],[121.0,71.0],[121.0,72.0],[119.0,74.0],[118.0,74.0],[115.0,77.0],[112.0,78.0],[107.0,82.0],[103.0,84.0],[101.0,84.0],[99.0,86.0],[96.0,87.0],[92.0,91.0],[91.0,91.0],[83.0,100.0],[82.0,104.0],[81.0,105.0],[81.0,110.0],[79.0,113.0],[79.0,115.0],[75.0,123.0],[70.0,128.0],[71.0,129.0],[75.0,129.0],[75.0,125.0],[78.0,122.0],[81.0,116.0],[83.0,114.0],[86.0,105.0],[89.0,102.0],[91.0,98.0],[97.0,92.0],[98.0,92.0],[104.0,86.0],[105.0,86.0],[110.0,82.0],[116.0,79.0],[120.0,75.0],[121.0,75.0],[124.0,72.0],[125.0,72.0],[128.0,69.0],[129.0,69.0],[136.0,62.0],[136.0,61.0],[141.0,57.0],[145.0,56.0],[145.0,55.0],[149.0,52.0],[152.0,52.0],[156.0,50.0]]},{"fill":"#ffb0bc","points":[[402.0,487.0],[399.0,485.0],[395.0,485.0],[389.0,488.0],[381.0,490.0],[371.0,495.0],[363.0,503.0],[358.0,504.0],[348.0,509.0],[349.0,510.0],[351.0,510.0],[352.0,509.0],[358.0,509.0],[359.0,508.0],[365.0,507.0],[370.0,503.0],[371.0,503.0],[374.0,500.0],[377.0,499.0],[382.0,495.0],[386.0,494.0],[389.0,492.0],[395.0,492.0],[396.0,491.0],[399.0,491.0],[401.0,490.0]]},{"fill":"#ffb0bc","points":[[528.0,247.0],[526.0,248.0],[526.0,257.0],[527.0,258.0],[527.0,265.0],[528.0,266.0],[528.0,279.0],[526.0,282.0],[526.0,285.0],[524.0,289.0],[524.0,295.0],[523.0,296.0],[523.0,302.0],[522.0,303.0],[522.0,321.0],[520.0,324.0],[520.0,327.0],[519.0,328.0],[518.0,333.0],[516.0,336.0],[516.0,339.0],[514.0,342.0],[515.0,344.0],[514.0,348.0],[516.0,347.0],[518.0,335.0],[523.0,327.0],[523.0,324.0],[524.0,323.0],[524.0,318.0],[526.0,315.0],[526.0,295.0],[527.0,294.0],[527.0,290.0],[528.0,289.0],[529.0,281.0],[530.0,280.0],[530.0,276.0],[529.0,274.0],[531.0,273.0],[531.0,264.0],[529.0,260.0],[529.0,253.0],[528.0,252.0]]},{"fill":"#ffb0bc","points":[[290.0,20.0],[287.0,19.0],[283.0,16.0],[278.0,15.0],[275.0,13.0],[263.0,13.0],[260.0,15.0],[258.0,15.0],[256.0,17.0],[246.0,22.0],[236.0,22.0],[235.0,21.0],[233.0,22.0],[235.0,22.0],[236.0,23.0],[240.0,23.0],[241.0,24.0],[246.0,24.0],[247.0,25.0],[252.0,25.0],[253.0,24.0],[256.0,24.0],[263.0,20.0],[269.0,19.0],[270.0,18.0],[277.0,18.0],[278.0,19.0],[284.0,20.0],[287.0,22.0],[290.0,22.0]]},{"fill":"#ffb0bc","points":[[35.0,193.0],[34.0,193.0],[29.0,199.0],[26.0,205.0],[25.0,210.0],[24.0,211.0],[24.0,217.0],[25.0,218.0],[26.0,231.0],[27.0,232.0],[27.0,235.0],[28.0,236.0],[28.0,239.0],[29.0,240.0],[29.0,247.0],[28.0,248.0],[28.0,250.0],[26.0,254.0],[23.0,257.0],[23.0,259.0],[20.0,263.0],[19.0,267.0],[18.0,268.0],[18.0,271.0],[19.0,272.0],[19.0,277.0],[20.0,278.0],[19.0,282.0],[21.0,282.0],[21.0,273.0],[22.0,272.0],[23.0,261.0],[26.0,257.0],[26.0,256.0],[30.0,252.0],[31.0,250.0],[31.0,243.0],[29.0,242.0],[30.0,238.0],[29.0,237.0],[29.0,233.0],[28.0,232.0],[28.0,229.0],[27.0,228.0],[27.0,218.0],[28.0,217.0],[28.0,213.0],[29.0,212.0],[30.0,206.0],[32.0,204.0],[32.0,203.0],[34.0,202.0],[34.0,199.0],[36.0,197.0]]},{"fill":"#ffb0bc","points":[[34.0,351.0],[33.0,352.0],[34.0,354.0],[36.0,354.0],[40.0,356.0],[41.0,360.0],[43.0,363.0],[43.0,365.0],[46.0,370.0],[46.0,373.0],[47.0,374.0],[47.0,385.0],[48.0,386.0],[48.0,393.0],[49.0,394.0],[49.0,397.0],[52.0,403.0],[57.0,408.0],[60.0,408.0],[61.0,407.0],[61.0,403.0],[58.0,397.0],[54.0,393.0],[51.0,387.0],[50.0,379.0],[47.0,374.0],[47.0,370.0],[43.0,363.0],[42.0,357.0],[39.0,354.0],[36.0,353.0]]},{"fill":"#ffb0bc","points":[[477.0,418.0],[475.0,419.0],[471.0,423.0],[467.0,432.0],[465.0,434.0],[465.0,436.0],[461.0,444.0],[456.0,450.0],[456.0,451.0],[449.0,457.0],[444.0,459.0],[436.0,467.0],[435.0,470.0],[436.0,470.0],[437.0,468.0],[442.0,463.0],[445.0,463.0],[450.0,458.0],[451.0,458.0],[460.0,449.0],[460.0,448.0],[464.0,443.0],[468.0,435.0],[468.0,433.0],[470.0,431.0],[470.0,429.0],[473.0,423.0],[476.0,420.0],[477.0,420.0]]},{"fill":"#ffb0bc","points":[[418.0,70.0],[418.0,73.0],[426.0,77.0],[432.0,78.0],[433.0,79.0],[441.0,79.0],[445.0,81.0],[452.0,88.0],[454.0,93.0],[456.0,95.0],[458.0,95.0],[455.0,87.0],[449.0,81.0],[449.0,80.0],[447.0,80.0],[443.0,78.0],[438.0,78.0],[437.0,77.0],[431.0,77.0],[430.0,76.0],[427.0,76.0],[422.0,71.0]]},{"fill":"#ffb0bc","points":[[134.0,472.0],[134.0,474.0],[147.0,487.0],[151.0,489.0],[157.0,490.0],[158.0,491.0],[161.0,491.0],[162.0,492.0],[169.0,493.0],[175.0,496.0],[178.0,499.0],[182.0,501.0],[185.0,504.0],[186.0,504.0],[191.0,508.0],[196.0,509.0],[192.0,507.0],[190.0,505.0],[186.0,503.0],[183.0,500.0],[182.0,500.0],[172.0,493.0],[166.0,492.0],[165.0,491.0],[162.0,491.0],[161.0,490.0],[158.0,490.0],[157.0,489.0],[154.0,489.0],[153.0,488.0],[149.0,487.0],[136.0,474.0],[136.0,473.0]]},{"fill":"#ffb0bc","points":[[509.0,177.0],[510.0,180.0],[512.0,181.0],[518.0,187.0],[518.0,189.0],[519.0,190.0],[518.0,200.0],[517.0,201.0],[518.0,203.0],[517.0,205.0],[518.0,207.0],[518.0,212.0],[519.0,211.0],[519.0,207.0],[520.0,206.0],[520.0,193.0],[521.0,192.0],[521.0,189.0],[518.0,183.0],[515.0,180.0]]},{"fill":"#ffb0bc","points":[[210.0,515.0],[210.0,516.0],[213.0,518.0],[215.0,518.0],[216.0,519.0],[218.0,519.0],[219.0,518.0],[219.0,517.0],[217.0,515.0]]}];
  const paths=artwork.map(part=>{
    const path=make('path',{'pointer-events':'none'});
    path.style.cssText='fill:'+part.fill+'!important;stroke:none!important;filter:none!important';
    visual.appendChild(path);return path;
  });
  const hit = make('path',{
    id:'wall-mirror-hit',
    'data-open':'dressup',
    role:'button',tabindex:0,
    'aria-label':'Ouvrir About me et le jeu d’habillage',
    fill:'transparent',stroke:'transparent',
    'pointer-events':'all'
  });
  hit.style.cssText='cursor:pointer;touch-action:none';
  const editorLayer = make('g',{id:'nana-wall-mirror-editor'});
  editorLayer.style.pointerEvents='none';
  const guide = make('polygon',{
    fill:'none',stroke:'#ff173b','stroke-width':2.5,
    'vector-effect':'non-scaling-stroke','stroke-dasharray':'7 5',
    'pointer-events':'none'
  });
  const handles = [0,1,2,3].map(index => {
    const handle=make('circle',{
      'data-mirror-corner':index,
      r:10,fill:'#fff4fa',stroke:'#ff173b',
      'stroke-width':3,'vector-effect':'non-scaling-stroke',
      'pointer-events':'all',
      'aria-label':'Coin '+(index+1)+' du miroir'
    });
    handle.style.cssText='cursor:crosshair;touch-action:none;pointer-events:all';
    return handle;
  });
  if (editing) editorLayer.append(guide,...handles);
  group.append(defs,visual,hit,editorLayer);
  // The mirror is the final SVG layer so it remains clickable above room hotspots.
  svg.appendChild(group);
  const style=document.createElement('style');
  style.id='wall-mirror-perspective-style';
  style.textContent=[
    // Keep the mirror fully clickable without the rectangular/dashed hotspot frame.
    '#wall-mirror-hit,#wall-mirror-hit:hover,#wall-mirror-hit:focus,#wall-mirror-hit:focus-visible,#wall-mirror-hit:active{outline:none;box-shadow:none;stroke:transparent;stroke-width:0;stroke-dasharray:none}',
    'html.poster-edit-mode #wall-mirror-hit{stroke:#ff173b;stroke-width:2;stroke-dasharray:5 5;cursor:move}'
  ].join('\n');
  document.head.appendChild(style);

  function render() {
    const p=state.quad;
    artwork.forEach((part,index)=>{
      paths[index].setAttribute('d','M '+part.points.map(([x,y])=>interp(p,x/W,y/H).join(' ')).join(' L ')+' Z');
    });
    // The hit area follows the transformed oval, not a rectangular box.
    const oval=[];
    for(let i=0;i<40;i++){
      const angle=i*2*Math.PI/40;
      oval.push(interp(p,.5+.47*Math.cos(angle),.5+.47*Math.sin(angle)));
    }
    hit.setAttribute('d','M '+oval.map(point=>point.join(' ')).join(' L ')+' Z');
    if(editing){
      guide.setAttribute('points',pointsToString(p));
      handles.forEach((handle,index)=>{
        handle.setAttribute('cx',p[index][0]);
        handle.setAttribute('cy',p[index][1]);
      });
    }
  }
  render();

  hit.addEventListener('keydown',event=>{
    if((event.key==='Enter'||event.key===' ') && !editing){
      event.preventDefault();
      hit.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
    }
  });
  if (!editing) return;

  // In edit mode moving the mirror must not trigger the dress-up interaction.
  group.addEventListener('click',event=>{
    if(event.target===hit || event.target.closest('[data-mirror-corner]')){
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },true);

  let drag=null;
  group.addEventListener('pointerdown',event=>{
    const cornerEl=event.target.closest('[data-mirror-corner]');
    if(event.target!==hit && !cornerEl) return;
    if(event.pointerType==='mouse' && event.button!==0) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const rect=svg.getBoundingClientRect();
    drag={
      id:event.pointerId,
      corner:cornerEl ? Number(cornerEl.getAttribute('data-mirror-corner')) : null,
      client:[event.clientX,event.clientY],
      quad:copy(state.quad),
      scale:[roomW/rect.width,roomH/rect.height]
    };
    try {event.target.setPointerCapture(event.pointerId)} catch (_) {}
  },true);
  window.addEventListener('pointermove',event=>{
    if(!drag || event.pointerId!==drag.id) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const dx=(event.clientX-drag.client[0])*drag.scale[0];
    const dy=(event.clientY-drag.client[1])*drag.scale[1];
    if(drag.corner===null){
      state.quad=drag.quad.map(p=>[p[0]+dx,p[1]+dy]);
    } else {
      state.quad=copy(drag.quad);
      state.quad[drag.corner]=[
        drag.quad[drag.corner][0]+dx,
        drag.quad[drag.corner][1]+dy
      ];
    }
    render();
  },true);
  function stopDrag(event) {
    if(!drag || (event.pointerId!==undefined && event.pointerId!==drag.id)) return;
    drag=null;store();
  }
  window.addEventListener('pointerup',stopDrag,true);
  window.addEventListener('pointercancel',stopDrag,true);
  window.addEventListener('blur',()=>stopDrag({}));

  const panel=document.getElementById('poster-edit-panel');
  if (panel) {
    const section=document.createElement('div');
    section.id='wall-mirror-editor-controls';
    section.style.cssText='margin-top:10px;padding-top:10px;border-top:1px solid #ff173b;font:12px/1.4 system-ui,sans-serif';
    const label=document.createElement('div');
    label.textContent='Miroir : glisse le centre pour déplacer ; tire les 4 ronds pour la perspective.';
    label.style.marginBottom='6px';
    section.append(label);
    const controls=document.createElement('div');
    controls.style.cssText='display:flex;flex-wrap:wrap;gap:6px';
    function button(text,fn){
      const b=document.createElement('button');b.type='button';b.textContent=text;
      b.style.cssText='border:1px solid #ff173b;color:#ff173b;background:white;padding:5px 8px;cursor:pointer;font:12px system-ui,sans-serif';
      b.addEventListener('click',fn);controls.appendChild(b);
    }
    function scale(factor) {
      const p=state.quad;
      const horizontal=(Math.hypot(p[1][0]-p[0][0],p[1][1]-p[0][1]) +
        Math.hypot(p[2][0]-p[3][0],p[2][1]-p[3][1]))/2;
      if(horizontal*factor<55 || horizontal*factor>340) return;
      const mid=center(p);
      state.quad=p.map(point=>[
        mid[0]+(point[0]-mid[0])*factor,
        mid[1]+(point[1]-mid[1])*factor
      ]);
      render();store();
    }
    button('− Petit',()=>scale(.91));
    button('+ Grand',()=>scale(1.1));
    button('Redresser',()=>{
      const p=state.quad;
      const minX=Math.min(...p.map(x=>x[0])),maxX=Math.max(...p.map(x=>x[0]));
      const minY=Math.min(...p.map(x=>x[1])),maxY=Math.max(...p.map(x=>x[1]));
      state.quad=[[minX,minY],[maxX,minY],[maxX,maxY],[minX,maxY]];
      render();store();
    });
    button('Réinitialiser',()=>{
      state.quad=copy(defaultQuad);
      render();store();
    });
    button('Copier les coins',()=>{
      const data=JSON.stringify({mirror:'wall',corners:state.quad},null,2);
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(data).then(()=>{
          label.textContent='Coins du miroir copiés. Tu peux me les envoyer ici.';
        }).catch(()=>window.prompt('Copie les coins du miroir :',data));
      } else window.prompt('Copie les coins du miroir :',data);
    });
    section.append(controls);
    panel.appendChild(section);
  }
})();
