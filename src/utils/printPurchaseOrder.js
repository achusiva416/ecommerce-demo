export const printPurchaseOrder = async (items, dealerName, logoUrl) => {
  const getBase64Image = async (imgUrl) => {
    try {
      const resp = await fetch(imgUrl);
      const blob = await resp.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error("Error converting image:", e);
      return "";
    }
  };

  const logoBase64 = logoUrl ? await getBase64Image(logoUrl) : "";
  const grandTotal = items.reduce((acc, i) => acc + (i.quantity * i.rate), 0);
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  const rowsHtml = items.map((item, idx) => `
    <tr>
      <td style="text-align: center; border: 1px solid #333; padding: 8px;">${idx + 1}</td>
      <td style="padding: 10px; border: 1px solid #333; text-align: left;">
        ${item.name}
      </td>
      <td style="text-align: center; border: 1px solid #333; padding: 8px;">${item.quantity}</td>
      <td style="text-align: center; border: 1px solid #333; padding: 8px;">${item.rate}</td>
      <td style="text-align: center; border: 1px solid #333; padding: 8px;">${(item.quantity * item.rate).toLocaleString()}</td>
    </tr>
  `).join("");

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>Purchase Order - ${dealerName}</title>
        <style>
          @page { size: auto; margin: 20mm; }
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; line-height: 1.4; }
          .header-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 1px solid #333; padding-bottom: 20px; }
          .logo-side img { max-height: 100px; }
          .address-side { text-align: right; font-size: 12px; line-height: 1.5; }
          .title-section { text-align: center; margin-bottom: 40px; }
          .title-section h2 { margin-bottom: 8px; font-weight: bold; font-size: 22px; }
          .title-section .date { font-size: 14px; color: #555; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #fff; font-weight: bold; text-align: center; padding: 12px 8px; border: 1px solid #333; font-size: 13px; text-transform: none; }
          td { font-size: 13px; border: 1px solid #333; }
          .total-row td { font-weight: bold; }
          @media print {
            body { padding: 0; }
            .header-container { border-bottom-width: 1px; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        </style>
      </head>
      <body>
        <div class="header-container">
          <div class="logo-side">
            ${logoBase64 ? `<img src="${logoBase64}" alt="Yogify Logo" />` : '<strong>YOGIFY</strong>'}
          </div>
          <div class="address-side">
            <strong>Yogify,</strong><br/>
            Kottuparambil tower,<br/>
            Old Market Rd,<br/>
            Angamaly, Kerala<br/>
            Pin: 683572<br/><br/>
            Phone: 7510105399, 9539549705
          </div>
        </div>

        <div class="title-section">
          <h2>Product requirement from ${dealerName} by Yogify</h2>
          <div class="date">Date: ${dateStr}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 60px;">So No</th>
              <th style="text-align: left;">Product</th>
              <th style="width: 160px;">Product Requirement</th>
              <th style="width: 170px;">Quoted Price per item (RS)</th>
              <th style="width: 130px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            <tr class="total-row">
              <td colspan="4" style="text-align: right; border: 1px solid #333; padding: 12px;">Total</td>
              <td style="text-align: center; border: 1px solid #333; padding: 12px;">${grandTotal.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  `);
  printWindow.document.close();
  
  // Wait for content (especially images) to be ready
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, 800);
};
