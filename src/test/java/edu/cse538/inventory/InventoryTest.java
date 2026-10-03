package edu.cse538.inventory;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class InventoryTest {
    private Inventory inventory;

    @BeforeEach
    void setUp() {
        inventory = new Inventory();
        inventory.addItem("Notebook", 10, new BigDecimal("2.50"));
    }

    @Test
    void addStockIncreasesItemQuantity() {
        inventory.addStock("Notebook", 5);

        assertEquals(15, inventory.getQuantity("Notebook"));
    }

    @Test
    void removeStockDecreasesItemQuantity() {
        inventory.removeStock("Notebook", 4);

        assertEquals(6, inventory.getQuantity("Notebook"));
    }

    @Test
    void inventoryValueIsQuantityTimesUnitPrice() {
        inventory.addItem("Pen", 3, new BigDecimal("1.20"));

        assertEquals(new BigDecimal("28.60"), inventory.calculateInventoryValue());
    }

    @Test
    void removingMoreThanAvailableStockIsRejected() {
        assertThrows(IllegalArgumentException.class,
                () -> inventory.removeStock("Notebook", 11));
        assertEquals(10, inventory.getQuantity("Notebook"));
    }

    @Test
    void addingDuplicateItemIsRejected() {
        assertThrows(IllegalArgumentException.class,
                () -> inventory.addItem("Notebook", 1, new BigDecimal("2.50")));
    }
}
