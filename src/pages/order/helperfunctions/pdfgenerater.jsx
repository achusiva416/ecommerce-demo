import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
export const generatePDF = (orders, title) => {
    const doc = new jsPDF();
    
    doc.setFont('helvetica');
    doc.setFontSize(10);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(title, 14, 15);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 160, 15);
    
    const headers = [
      "Timestamp",
      "Full Name",
      "Contact Number",
      "Secondary Contact",
      "Product(s)",
      "Delivery Address",
      "Home Delivery"
    ];
    
    const tableData = orders.map(order => {
      const products = order.order_items.map(item => {
        if (item.product_type === 'combo' && item.combo) {
          return item.combo.title;
        } else if (item.product) {
          return item.product.name;
        }
        return '';
      }).join(", ");
      
      return [
        new Date(order.created_at).toLocaleString(),
        order.name,
        order.phone,
        order.user?.secondary_phone || "-",
        products,
        `${order.address}, ${order.city}, ${order.state}, ${order.pincode}`,
        order.delivery_partner == 'indianpost' ? 'Yes' : 'No',
      ];
    });
    
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 25,
      margin: { top: 20 },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 20 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 35 },
        5: { cellWidth: 45 },
        6: { cellWidth: 20 },
      },
      didDrawPage: function (data) {
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${doc.internal.getNumberOfPages()}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      }
    });

    doc.save(`product_orders_${new Date().toISOString().slice(0,10)}.pdf`);
};



