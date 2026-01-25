package com.app.gestion.utilitaire;

import java.util.concurrent.atomic.AtomicInteger;

public class ReferenceGenerator {

    private static AtomicInteger counter = new AtomicInteger(0);

    public static String generateReference(String prefix) {
        int uniqueNumber = counter.incrementAndGet();
        long timestamp = System.currentTimeMillis();
        return prefix + String.valueOf(timestamp) + String.format("%05d", uniqueNumber);
    }

}