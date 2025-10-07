package com.pomoclockfy.entity;

public enum SessionType {
    WORK("work"),
    BREAK("break"),
    LONG_BREAK("longBreak");
    
    private final String value;
    
    SessionType(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
    
    public static SessionType fromValue(String value) {
        for (SessionType type : SessionType.values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown session type: " + value);
    }
}