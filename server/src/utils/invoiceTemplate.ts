export const invoiceTemplate = ({ order, items, address, invoiceNo }: any) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    @page {
      margin: 40px;
    }

    body {
      font-family: "Helvetica Neue", Arial, sans-serif;
      color: #111;
      background: #faf9f6;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    /* HEADER */
    .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 60px;
}


   .logo {
  height: 240px;
  max-width: 260px;
  object-fit: contain;
}

    .invoice-title {
      font-size: 42px;
      letter-spacing: 2px;
    }

    /* BILLING */
    .billing {
      display: flex;
      justify-content: space-between;
      margin-bottom: 50px;
    }

    .billing h4 {
      margin-bottom: 8px;
      font-size: 14px;
      letter-spacing: 1px;
    }

    .billing p {
      margin: 2px 0;
      font-size: 14px;
      color: #333;
    }

    /* TABLE */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 40px;
    }

    thead th {
      text-align: left;
      padding: 12px 8px;
      border-bottom: 1px solid #333;
      font-size: 14px;
    }

    tbody td {
      padding: 14px 8px;
      border-bottom: 1px solid #ddd;
      font-size: 14px;
    }

    .right {
      text-align: right;
    }

    /* TOTALS */
    .totals {
      width: 100%;
      max-width: 320px;
      margin-left: auto;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }

    .totals-row.total {
      font-size: 22px;
      font-weight: 600;
      border-top: 1px solid #333;
      padding-top: 16px;
      margin-top: 10px;
    }

    /* FOOTER */
    .footer {
      margin-top: 80px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .thank-you {
      font-size: 32px;
      font-weight: 300;
    }

    .company-info {
      text-align: right;
      font-size: 14px;
    }
  </style>
</head>

<body>
  <div class="container">

    <!-- HEADER -->
    <div class="header">
      <img
        src="https://aexpzoeclxoklxjznqjr.supabase.co/storage/v1/object/public/rough/logo.png"
        class="logo"
      />
      <div class="invoice-title">INVOICE</div>
    </div>

    <!-- BILLING INFO -->
    <div class="billing">
      <div>
        <h4>BILLED TO</h4>
        <p>${address.fullName}</p>
        <p>${address.phone}</p>
        <p>
          ${address.roadStreet || ""}<br/>
          ${address.city}, ${address.state} - ${address.pinCode}
        </p>
      </div>

      <div>
        <p><b>Invoice No:</b> ${invoiceNo}</p>
        <p><b>Date:</b> ${new Date(order.created_at).toDateString()}</p>
      </div>
    </div>

    <!-- ITEMS -->
    <table>
      <thead>
        <tr>
          <th>Service</th>
          <th class="right">Qty</th>
          <th class="right">Unit Price</th>
          <th class="right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (item: any) => `
            <tr>
              <td>${item.services.title}</td>
              <td class="right">1</td>
              <td class="right">₹${item.price}</td>
              <td class="right">₹${item.price}</td>
            </tr>
          `
          )
          .join("")}
      </tbody>
    </table>

    <!-- TOTALS -->
    <div class="totals">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>₹${order.totalAmount}</span>
      </div>
      <div class="totals-row">
        <span>Tax</span>
        <span>₹0</span>
      </div>
      <div class="totals-row total">
        <span>Total</span>
        <span>₹${order.totalAmount}</span>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <div class="thank-you">Thank you!</div>
      <div class="company-info">
        <b>ServeCity</b><br/>
        Premium Home Services Just in Click <br/>
       abhinavderapur0@gmail.com
      </div>
    </div>

  </div>
</body>
</html>
`;
};
