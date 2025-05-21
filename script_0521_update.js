diff --git a/script.js b/script.js
index a09ef03..9123224 100644
--- a/script.js
+++ b/script.js
@@ -1,30 +1,69 @@
-
 fetch("knn_result.json")
   .then(response => response.json())
   .then(data => {
     const map = L.map("map").setView([37.5, 127], 12);
-    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
+        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
+
+    const entries = [];
 
     data.forEach(entry => {
       const t = entry.target;
-      const marker = L.marker([t.y, t.x]).addTo(map);
-      marker.bindPopup(`<b>���� ��� ${t.index}</b><br>${t.address}`);
+      const targetMarker = L.marker([t.y, t.x]);
+      targetMarker.bindPopup(`<b>���� ��� ${t.index}</b><br>${t.address}`);
 
-      entry.neighbors.forEach(n => {
+      const neighbors = entry.neighbors.slice(0, 3).map(n => {
         const popup = `
           <b>���� �ŷ�</b><br>
           ${n.address}<br>
           �ŷ���: ${n.date}<br>
           ����Ÿ�: ${n.distance}<br>
           �����Ÿ�: ${n.real_distance} m<br>
           �����γ�: ${n.const_yy}<br>
           �ǹ�����: ${n.area}<br>
           ��������: ${n.land}<br>
           ���ð��ݴܰ�: ${n.pnilp}<br>
           �ŷ��ݾ�: ${n.amount}
         `;
-        L.marker([n.y, n.x]).addTo(map).bindPopup(popup);
-        L.polyline([[t.y, t.x], [n.y, n.x]], {color: "black"}).addTo(map);
+        const marker = L.marker([n.y, n.x]).bindPopup(popup);
+        const line = L.polyline([[t.y, t.x], [n.y, n.x]], {color: "black"});
+        return { marker, line };
+      });
+
+      targetMarker.on('click', () => {
+        // remove neighbors for all entries first
+        entries.forEach(e => {
+          e.neighbors.forEach(obj => {
+            map.removeLayer(obj.marker);
+            map.removeLayer(obj.line);
+          });
+        });
+        // add neighbors for this target
+        neighbors.forEach(obj => {
+          obj.marker.addTo(map);
+          obj.line.addTo(map);
+        });
       });
+
+      entries.push({ marker: targetMarker, neighbors });
     });
+
+    function updateMarkers() {
+      const zoom = map.getZoom();
+      entries.forEach(e => {
+        if (zoom >= 15) {
+          if (!map.hasLayer(e.marker)) {
+            e.marker.addTo(map);
+          }
+        } else {
+          map.removeLayer(e.marker);
+          e.neighbors.forEach(obj => {
+            map.removeLayer(obj.marker);
+            map.removeLayer(obj.line);
+          });
+        }
+      });
+    }
+
+    map.on('zoomend', updateMarkers);
+    updateMarkers();
   });
