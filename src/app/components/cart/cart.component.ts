import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule,
            FormsModule,
            MatButtonModule,
            MatCheckboxModule,
            MatIconModule
            ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})

export class CartComponent {
  cartItems: any[] = [];
  selectedItems: { [key: number]: number } = {};
  cart: any[] = [];
  discount: number = 0;
  discountDetails: string[] = []; 
  percentageDiscount: number = 0; 
  categoryDiscount: string = ''; 
  pointsDiscount: number = 0; 
  isLoading: boolean = false;

  campaigns = [
    { id: 1, 
      name: "Fixed Amount Discount", 
      category: "coupon", amount: 50, 
      selected: false 
    },
    { id: 2, 
      name: "Percentage Discount", 
      category: "coupon", 
      percentage: 10, 
      selected: false 
    },
    { id: 3, 
      name: "Percentage Discount by Item Category", 
      category: "onTop", 
      percentage: 15, 
      selected: false, 
      selectedCategory: '' 
    },
    { id: 4, 
      name: "Discount by Points", 
      category: "onTop", 
      points: 68, 
      maxDiscount: 20, 
      selected: false 
    },
    {
      id: 5,
      name: "Special Seasonal Discount",
      category: "seasonal",
      threshold: 300,
      discount: 40,
      selected: false,
      everyX: 300,
      discountY: 40
    }
  ];

  constructor() {
    this.loadCartItems();
  }

  loadCartItems() {
    const data = [
      {
        "id": 1,
        "name": "T-Shirt",
        "category": "Clothing",
        "price": 350,
        "quantity": 1,
        "imageUrl": "assets/images/T-shirt.jpg"
      },
      {
        "id": 2,
        "name": "Hoodie",
        "category": "Clothing",
        "price": 850,
        "quantity": 1,
        "imageUrl": "assets/images/Hoodie.jpg"
      },
      {
        "id": 3,
        "name": "Hat",
        "category": "Accessories",
        "price": 250,
        "quantity": 1,
        "imageUrl": "assets/images/Hat.jpg"
      },
      {
        "id": 4,
        "name": "Watch",
        "category": "Electronic",
        "price": 850,
        "quantity": 1,
        "imageUrl": "assets/images/Watch.jpg"
      },
      {
        "id": 5,
        "name": "Bag",
        "category": "Accessories",
        "price": 640,
        "quantity": 1,
        "imageUrl": "assets/images/Bag.jpg"
      },
      {
        "id": 6,
        "name": "Belt",
        "category": "Accessories",
        "price": 230,
        "quantity": 1,
        "imageUrl": "assets/images/belt.jpg"
      }
    ];

    this.cartItems = data; 
  }

  addToCart(item: any) {
    const existingItem = this.cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.push({ ...item, quantity: 1 });
    }
  }

  calculateDiscountedPrice() {
    this.isLoading = true; 

    let totalPrice = this.getTotalPrice();
    this.discount = 0; 
    this.discountDetails = []; 

    const couponCampaigns = this.campaigns.filter(campaign => campaign.selected && campaign.category === "coupon");
    couponCampaigns.forEach(campaign => {
      if (campaign.category === "coupon") {
        if (campaign.amount !== undefined) {
          this.discount += campaign.amount;
          totalPrice -= campaign.amount;
          this.discountDetails.push(`Discount: ${campaign.amount} THB`); 
        }
        if (campaign.percentage !== undefined) {
          this.percentageDiscount = campaign.percentage;
          this.discount += totalPrice * (campaign.percentage / 100);
          totalPrice -= this.discount;
          this.discountDetails.push(`Discount: ${this.percentageDiscount}%`); 
        }
      }
    });

    const onTopCampaigns = this.campaigns.filter(campaign => campaign.selected && campaign.category === "onTop");
    onTopCampaigns.forEach(campaign => {
      if (campaign.selectedCategory && campaign.percentage !== undefined) {
        let categoryDiscount = 0;
        let categoryItemsCount = 0;
        this.cart.forEach(item => {
          if (item.category === campaign.selectedCategory) {
            const discountAmount = (item.price * (campaign.percentage / 100)) * item.quantity;
            categoryDiscount += discountAmount;
            categoryItemsCount += item.quantity;
          }
        });

        if (categoryDiscount > 0) {
          this.discount += categoryDiscount;
          totalPrice -= categoryDiscount;
          this.categoryDiscount = `${categoryDiscount} THB off on ${campaign.selectedCategory}`;
          this.discountDetails.push(`Discount: ${campaign.percentage}% off on ${campaign.selectedCategory} items`); 
        }
      } else if (campaign.points !== undefined) {
        const pointsDiscount = Math.min(totalPrice * 0.2, campaign.points);
        this.pointsDiscount = pointsDiscount;
        this.discount += pointsDiscount;
        totalPrice -= pointsDiscount;
        this.discountDetails.push(`Points: ${pointsDiscount} Points`); 
      }
    });

    const seasonalCampaigns = this.campaigns.filter(campaign => campaign.selected && campaign.category === "seasonal");
    seasonalCampaigns.forEach(campaign => {
      if (campaign.everyX && campaign.discountY) {
        const discountAmount = Math.floor(totalPrice / campaign.everyX) * campaign.discountY;
        this.discount += discountAmount;
        totalPrice -= discountAmount;
        this.discountDetails.push(`Discount: ${campaign.discountY} THB at every ${campaign.everyX} THB spent`); 
      }
    });

    this.isLoading = false;
    return totalPrice;
  }

  getTotalPrice() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  selectCampaign(campaignId: number) {
    const selectedCampaign = this.campaigns.find(campaign => campaign.id === campaignId);

    if (selectedCampaign) {
      const categoryCampaigns = this.campaigns.filter(campaign => campaign.category === selectedCampaign.category && campaign.selected);
      if (categoryCampaigns.length > 0 && !selectedCampaign.selected) {
        alert('Cannot select multiple campaigns with the same category!');
        return;
      }

      selectedCampaign.selected = !selectedCampaign.selected;
    }

    this.discount = 0;
    this.discountDetails = []; 
    console.log(`Selected Campaigns: ${this.campaigns.filter(c => c.selected).map(c => c.name).join(", ")}`);
    console.log(`Discount applied: ${this.discount} THB`);
    console.log(`Total Price after Discount: ${this.calculateDiscountedPrice()} THB`);
  }

  changeQuantity(item: any, action: 'add' | 'remove') {
    const cartItem = this.cart.find(cartItem => cartItem.id === item.id);
    if (action === 'add') {
      cartItem.quantity++;
    } else if (action === 'remove' && cartItem.quantity > 1) {
      cartItem.quantity--;
    }
  }

  removeItem(item: any) {
    const index = this.cart.findIndex(cartItem => cartItem.id === item.id);
    if (index !== -1) {
      this.cart.splice(index, 1); 
    }
  }

  onCategoryChange(selectedCategory: string) {
    if (!selectedCategory) {
      console.error("Selected category is undefined or empty");
    } else {
      this.discountDetails = [];  
      this.calculateDiscountedPrice(); 
    }
  }

  getItemTotalPrice(item: any) {
    return item.price * item.quantity;
  }

  getCategories() {
    return [...new Set(this.cartItems.map(item => item.category))];
  }
}
