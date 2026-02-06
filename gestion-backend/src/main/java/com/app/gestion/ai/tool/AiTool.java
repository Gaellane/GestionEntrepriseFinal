package com.app.gestion.ai.tool;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AiTool {
    String name();                 // nom logique exposé au LLM
    String description();          // ce que fait la fonction
    String domain() default "general";

    boolean readOnly() default true;
    boolean dangerous() default false;

    String[] rolesAllowed() default {};
}
