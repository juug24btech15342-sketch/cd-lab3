package edu.cse538.inventory;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class Inventory {
    private final Map<String, Item> items = new HashMap<>();

    public void addItem(String name, int quantity, BigDecimal unitPrice) {
        validateName(name);
        validateQuantity(quantity);
        validatePrice(unitPrice);

        if (items.containsKey(name)) {
            throw new IllegalArgumentException("An item with this name already exists: " + name);
        }
        items.put(name, new Item(quantity, unitPrice));
    }

    public void addStock(String name, int quantity) {
        validateQuantity(quantity);
        Item item = findItem(name);
        item.quantity = Math.addExact(item.quantity, quantity);
    }

    public void removeStock(String name, int quantity) {
        validateQuantity(quantity);
        Item item = findItem(name);
        if (quantity > item.quantity) {
            throw new IllegalArgumentException("Cannot remove more stock than is available");
        }
        item.quantity -= quantity;
    }

    public BigDecimal calculateInventoryValue() {
        return items.values().stream()
                .map(item -> item.unitPrice.multiply(BigDecimal.valueOf(item.quantity)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public int getQuantity(String name) {
        return findItem(name).quantity;
    }

    public Map<String, Integer> getStockSnapshot() {
        Map<String, Integer> snapshot = new HashMap<>();
        items.forEach((name, item) -> snapshot.put(name, item.quantity));
        return Collections.unmodifiableMap(snapshot);
    }

    private Item findItem(String name) {
        validateName(name);
        Item item = items.get(name);
        if (item == null) {
            throw new IllegalArgumentException("Item not found: " + name);
        }
        return item;
    }

    private static void validateName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Item name must not be blank");
        }
    }

    private static void validateQuantity(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }
    }

    private static void validatePrice(BigDecimal unitPrice) {
        Objects.requireNonNull(unitPrice, "Unit price must not be null");
        if (unitPrice.signum() < 0) {
            throw new IllegalArgumentException("Unit price must not be negative");
        }
    }

    private static final class Item {
        private int quantity;
        private final BigDecimal unitPrice;

        private Item(int quantity, BigDecimal unitPrice) {
            this.quantity = quantity;
            this.unitPrice = unitPrice;
        }
    }
}
