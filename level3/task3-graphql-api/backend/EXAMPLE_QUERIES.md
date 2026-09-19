# Example GraphQL Operations

Open **http://localhost:5000/graphql** in a browser (Apollo Sandbox) and try these.

## 1. Sign up
```graphql
mutation Signup {
  signup(input: { name: "Jane Doe", email: "jane@example.com", password: "pass123" }) {
    token
    user { id name email role }
  }
}
```
Copy the returned `token`.

## 2. Set the Authorization header
In Apollo Sandbox, open the "Headers" panel at the bottom and add:
```json
{
  "Authorization": "Bearer PASTE_YOUR_TOKEN_HERE"
}
```

## 3. Who am I?
```graphql
query Me {
  me { id name email role }
}
```

## 4. Create a product (requires auth header from step 2)
```graphql
mutation CreateProduct {
  createProduct(input: { name: "Mechanical Keyboard", price: 79.99, stock: 15 }) {
    id
    name
    price
    stock
    owner { name email }
  }
}
```

## 5. List all products
```graphql
query AllProducts {
  products {
    id
    name
    price
    stock
    owner { name }
    createdAt
  }
}
```

## 6. Update a product (must be the owner or an admin)
```graphql
mutation UpdateProduct {
  updateProduct(id: "PASTE_PRODUCT_ID", input: { name: "Mechanical Keyboard (RGB)", price: 89.99, stock: 10 }) {
    id
    name
    price
    stock
  }
}
```

## 7. Delete a product
```graphql
mutation DeleteProduct {
  deleteProduct(id: "PASTE_PRODUCT_ID")
}
```

## 8. Login (existing user)
```graphql
mutation Login {
  login(input: { email: "jane@example.com", password: "pass123" }) {
    token
    user { id name role }
  }
}
```
