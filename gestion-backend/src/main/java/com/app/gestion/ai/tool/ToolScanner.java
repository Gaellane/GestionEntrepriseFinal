package com.app.gestion.ai.tool;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

import org.springframework.context.ApplicationContext;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class ToolScanner {
    private final ApplicationContext context;

    public List<ToolDefinition> scan()
    {
        List<ToolDefinition> tools = new ArrayList<>();

        for (String beanName : context.getBeanDefinitionNames()) {
            Object bean = context.getBean(beanName);

            for (Method method : bean.getClass().getMethods()) {
                AiTool annotation = method.getAnnotation(AiTool.class);
                if (annotation != null) {
                    tools.add(ToolDefinition.from(bean, method, annotation));
                }
            }
        }        

        return tools;
    }
}
