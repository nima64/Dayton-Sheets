# Notes

The sheet schema
``` 
 Row = {
  rowId:  number;
  make:   string;
  model:  string;
  config: string;
  qty:    number;
};

 MasterSheet {
  templateId:  string;       // PK
  buyerId:     string;       // FK → Buyer.userId
  title:       string;
  columns:     string[];
  rows:        Row[];
  sellers:     string[];     // UserIds
  sellerCopies?: Record<string, Row[]>; // optional per-seller view
}

 SellerCopy {
  templateId: string;  // PK (composite)
  sellerId:   string;  // PK
  rows:       Row[];
}

Buyer {
  userId:    string;   // PK
  templates: string[]; // templateIds the buyer owns
}

Seller {
  userId: string;      // PK
  copies: string[];    // templateIds the seller can see
}


```


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
