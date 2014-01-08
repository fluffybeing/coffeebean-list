Ajax::Application.routes.draw do
  resources :coffeebeans do
    resources :comments
  end
  root :to => redirect('/coffeebean.html')
end
