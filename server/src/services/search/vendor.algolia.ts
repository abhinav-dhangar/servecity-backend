import { algoliaClient, VENDOR_INDEX } from "@utils/algolia.conn";


export async function upsertVendorToAlgolia(vendor: any) {
  const record = {
    objectID: vendor.id,
    vendorName: vendor.vendorName,
    vendorDescription: vendor.vendorDescription,
    vendorCategory: vendor.vendorCategory,
    vendorAddress: vendor.vendorAddress,
    city: vendor.city,
    state: vendor.state,
    phone: vendor.phone,
    email: vendor.email,
    avatar_url: vendor.avatar_url,
  };

  const { taskID } = await algoliaClient.saveObject({
    indexName: VENDOR_INDEX,
    body: record,
  });

  await algoliaClient.waitForTask({ indexName: VENDOR_INDEX, taskID });

  console.log("✅ Vendor indexed:", vendor.id);
}
